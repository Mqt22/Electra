from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel

from Database import get_db
from Model import Product_Model, Review_Model

router = APIRouter()

class ProductCreate(BaseModel):
    category: str
    title: str
    price: float
    rating: float = 0
    description: str
    image_url: str
    images: list = []
    brand: str
    sku: str
    stock: int = 0
    specifications: dict = {}

# ---------------------------------------------------------
# UPDATE PRODUCT SCHEMA
# ---------------------------------------------------------

class ProductUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    description: Optional[str] = None


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
        
@router.post("/products")
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    try:
        product = Product_Model.product(
            category=product_data.category,
            title=product_data.title,
            price=product_data.price,
            rating=product_data.rating,
            description=product_data.description,
            image_url=product_data.image_url,
            images=product_data.images,
            brand=product_data.brand,
            sku=product_data.sku,
            stock=product_data.stock,
            specifications=product_data.specifications
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

    except SQLAlchemyError as e:
        db.rollback()

        print("Product creation error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to create product"
        )