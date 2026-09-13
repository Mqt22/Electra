import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Request
)

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field

from Database import get_db
from Model import Product_Model, Review_Model


router = APIRouter()


# ---------------------------------------------------------
# SETTINGS
# ---------------------------------------------------------

MAX_IMAGE_SIZE = 100 * 1024  # 100 KB

UPLOAD_FOLDER = Path("uploads/products")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
    "image/avif",
}


# ---------------------------------------------------------
# UPDATE PRODUCT SCHEMA
# ---------------------------------------------------------

class ProductUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    stock: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = None


# ---------------------------------------------------------
# IMAGE UPLOAD HELPER
# ---------------------------------------------------------

async def save_product_image(
    image: UploadFile,
    request: Request
) -> str:
    """
    Validates and saves one product image.
    Returns the public image URL.
    """

    if not image:
        raise HTTPException(
            status_code=400,
            detail="Image file is required"
        )

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported image format: {image.content_type}. "
                "Please upload a browser-supported image."
            )
        )

    image_data = await image.read()

    if len(image_data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Image '{image.filename}' is larger than 100 KB. "
                "Please upload an image of 100 KB or less."
            )
        )

    if len(image_data) == 0:
        raise HTTPException(
            status_code=400,
            detail=f"Image '{image.filename}' is empty"
        )

    original_extension = Path(image.filename or "").suffix.lower()

    if not original_extension:
        extension_map = {
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "image/bmp": ".bmp",
            "image/svg+xml": ".svg",
            "image/avif": ".avif",
        }

        original_extension = extension_map.get(
            image.content_type,
            ".img"
        )

    unique_filename = (
        f"{uuid.uuid4().hex}{original_extension}"
    )

    file_path = UPLOAD_FOLDER / unique_filename

    with open(file_path, "wb") as file:
        file.write(image_data)

    base_url = str(request.base_url).rstrip("/")

    return f"{base_url}/uploads/products/{unique_filename}"


# ---------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product_Model.product).all()

    return [
        {
            "id": product.id,
            "category": product.category,
            "title": product.title,
            "price": product.price,
            "rating": product.rating,
            "description": product.description,
            "image_url": product.image_url,
            "images": product.images,
            "brand": product.brand,
            "sku": product.sku,
            "stock": product.stock,
            "specifications": product.specifications
        }
        for product in products
    ]


@router.get("/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product_Model.product)
        .filter(Product_Model.product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    reviews = (
        db.query(Review_Model.review)
        .filter(Review_Model.review.product_id == product_id)
        .all()
    )

    return {
        "id": product.id,
        "category": product.category,
        "title": product.title,
        "price": product.price,
        "rating": product.rating,
        "description": product.description,
        "image_url": product.image_url,
        "images": product.images,
        "brand": product.brand,
        "sku": product.sku,
        "stock": product.stock,
        "specifications": product.specifications,
        "reviews": reviews
    }


# ---------------------------------------------------------
# UPDATE PRODUCT
# ---------------------------------------------------------

@router.put("/products/{product_id}")
def update_product(
    product_id: int,
    updated_product: ProductUpdate,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product_Model.product)
        .filter(Product_Model.product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    try:
        if updated_product.category is not None:
            product.category = updated_product.category

        if updated_product.title is not None:
            product.title = updated_product.title

        if updated_product.price is not None:
            product.price = updated_product.price

        if updated_product.rating is not None:
            product.rating = updated_product.rating

        if updated_product.description is not None:
            product.description = updated_product.description

        if updated_product.stock is not None:
            product.stock = updated_product.stock

        db.commit()
        db.refresh(product)

        return {
            "message": "Product updated successfully",
            "product_id": product.id
        }

    except SQLAlchemyError as e:
        db.rollback()

        print("Product update error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to update product"
        )


# ---------------------------------------------------------
# DELETE PRODUCT
# ---------------------------------------------------------

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product_Model.product)
        .filter(Product_Model.product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    try:
        db.delete(product)
        db.commit()

        return {
            "message": "Product deleted successfully",
            "product_id": product_id
        }

    except SQLAlchemyError as e:
        db.rollback()

        print("Product delete error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to delete product"
        )


# ---------------------------------------------------------
# CREATE PRODUCT WITH IMAGE UPLOADS
# ---------------------------------------------------------

@router.post("/products")
async def create_product(
    request: Request,

    category: str = Form(...),
    title: str = Form(...),
    price: float = Form(...),
    rating: float = Form(0),
    description: str = Form(...),
    brand: str = Form(...),
    sku: str = Form(...),
    stock: int = Form(0),

    main_image: UploadFile = File(...),
    child_images: list[UploadFile] = File(...),

    db: Session = Depends(get_db)
):
    if not child_images or len(child_images) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one child image is required"
        )

    saved_image_urls = []

    try:
        # Save main image
        main_image_url = await save_product_image(
            main_image,
            request
        )

        saved_image_urls.append(main_image_url)

        # Save child/gallery images
        child_image_urls = []

        for child_image in child_images:
            child_image_url = await save_product_image(
                child_image,
                request
            )

            child_image_urls.append(child_image_url)
            saved_image_urls.append(child_image_url)

        product = Product_Model.product(
            category=category,
            title=title,
            price=price,
            rating=rating,
            description=description,
            image_url=main_image_url,
            images=child_image_urls,
            brand=brand,
            sku=sku,
            stock=stock,
            specifications={}
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        return {
            "message": "Product created successfully",
            "product": {
                "id": product.id,
                "category": product.category,
                "title": product.title,
                "price": product.price,
                "rating": product.rating,
                "description": product.description,
                "image_url": product.image_url,
                "images": product.images,
                "brand": product.brand,
                "sku": product.sku,
                "stock": product.stock,
                "specifications": product.specifications
            }
        }

    except HTTPException:
        db.rollback()

        # Remove uploaded files if validation fails
        for image_url in saved_image_urls:
            filename = image_url.split("/")[-1]
            file_path = UPLOAD_FOLDER / filename

            if file_path.exists():
                file_path.unlink()

        raise

    except SQLAlchemyError as e:
        db.rollback()

        # Remove uploaded files if database creation fails
        for image_url in saved_image_urls:
            filename = image_url.split("/")[-1]
            file_path = UPLOAD_FOLDER / filename

            if file_path.exists():
                file_path.unlink()

        print("Product creation error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to create product"
        )