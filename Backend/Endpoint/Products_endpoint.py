from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Database import get_db
from Model import Product_Model

router = APIRouter()

# ---------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    show_all = db.query(Product_Model.product).all()
    return show_all


@router.get("/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product_Model.product).filter(
        Product_Model.product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    reviews = db.query(Product_Model.review).filter(
        Product_Model.review.product_id == product_id
    ).all()

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