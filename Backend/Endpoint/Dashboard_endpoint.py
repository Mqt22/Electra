from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from Database import get_db
from Model.Product_Model import product
from Model.Order_Model import Order


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db)):

    # Total products
    total_products = db.query(product).count()

    # Total unique categories
    total_categories = (
        db.query(product.category)
        .distinct()
        .count()
    )

    # Total orders
    total_orders = db.query(Order).count()

    # Total revenue
    total_revenue = (
        db.query(func.sum(Order.total_amount)).scalar()
        or 0
    )

    return {
        "total_categories": total_categories,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue)
    }