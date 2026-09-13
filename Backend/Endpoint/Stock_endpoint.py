
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from Database import session_local,get_db
from Model.Product_Model import product as Product
from Model.Stock_Model import Stock
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class StockCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=0)


class StockUpdate(BaseModel):
    quantity: int = Field(ge=0)


class StockResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

router = APIRouter()

# ---------------------------------------------------------
# GET STOCK FOR ALL PRODUCTS
# ---------------------------------------------------------

@router.get("/")
def get_all_stock(
    db: Session = Depends(get_db)
):
    products = db.query(Product).all()

    return [
        {
            "product_id": item.id,
            "title": item.title,
            "sku": item.sku,
            "stock": item.stock
        }
        for item in products
    ]


# ---------------------------------------------------------
# GET STOCK FOR ONE PRODUCT
# ---------------------------------------------------------

@router.get("/{product_id}")
def get_product_stock(
    product_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "product_id": item.id,
        "title": item.title,
        "sku": item.sku,
        "stock": item.stock
    }

# ---------------------------------------------------------
# CREATE STOCK
# ---------------------------------------------------------

@router.post("/")
def create_stock(
    stock_data: StockCreate,
    db: Session = Depends(get_db)
):
    item = db.query(Product).filter(
        Product.id == stock_data.product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    item.stock = stock_data.quantity

    db.commit()
    db.refresh(item)

    return {
        "message": "Stock created successfully",
        "product_id": item.id,
        "title": item.title,
        "sku": item.sku,
        "stock": item.stock
    }

# ---------------------------------------------------------
# UPDATE STOCK
# ---------------------------------------------------------

@router.put("/{product_id}")
def update_stock(
    product_id: int,
    stock_data: StockUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    item.stock = stock_data.quantity

    db.commit()
    db.refresh(item)

    return {
        "message": "Stock updated successfully",
        "product_id": item.id,
        "title": item.title,
        "stock": item.stock
    }


# ---------------------------------------------------------
# DELETE STOCK
# ---------------------------------------------------------

@router.delete("/{product_id}")
def delete_stock(
    product_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Set stock to zero instead of deleting the product
    item.stock = 0

    db.commit()
    db.refresh(item)

    return {
        "message": "Stock deleted successfully",
        "product_id": item.id,
        "stock": item.stock
    }