from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from datetime import datetime

from Model import Order_Model
from Database import get_db

from typing import Optional, Any

router = APIRouter()


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    items: dict
    total_amount: float
    status: str = "pending"


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    items: Optional[Any] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None
    updated_at: Optional[str] = None


@router.post("/orders")
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    try:
        now = datetime.now().isoformat()

        new_order = Order_Model.Order(
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            items=order.items,
            total_amount=order.total_amount,
            status=order.status,
            created_at=now,
            updated_at=None,
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return {
            "message": "Order created successfully",
            "order_id": new_order.id,
        }

    except SQLAlchemyError as e:
        db.rollback()
        print("Order creation error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to create order"
        )


@router.get("/orders/{order_id}")
async def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = (
        db.query(Order_Model.Order)
        .filter(Order_Model.Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order


@router.put("/orders/{order_id}")
async def update_order(
    order_id: int,
    updated_order: OrderUpdate,
    db: Session = Depends(get_db)
):
    order = (
        db.query(Order_Model.Order)
        .filter(Order_Model.Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    try:

        # Only update fields that were provided

        if updated_order.customer_name is not None:
            order.customer_name = updated_order.customer_name

        if updated_order.customer_email is not None:
            order.customer_email = updated_order.customer_email

        if updated_order.items is not None:
            order.items = updated_order.items

        if updated_order.total_amount is not None:
            order.total_amount = updated_order.total_amount

        if updated_order.status is not None:
            order.status = updated_order.status

        order.updated_at = datetime.now()

        db.commit()
        db.refresh(order)

        return {
            "message": "Order updated successfully",
            "order_id": order.id,
        }

    except SQLAlchemyError as e:
        db.rollback()

        print("Order update error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to update order"
        )


@router.delete("/orders/{order_id}")
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = (
        db.query(Order_Model.Order)
        .filter(Order_Model.Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    try:
        db.delete(order)
        db.commit()

        return {
            "message": "Order deleted successfully",
            "order_id": order.id,
        }

    except SQLAlchemyError as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete order"
        )


@router.get("/orders")
async def list_orders(
    db: Session = Depends(get_db)
):
    return db.query(Order_Model.Order).all()