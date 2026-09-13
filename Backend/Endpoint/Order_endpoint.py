from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from datetime import datetime
import urllib.parse

from Model import Order_Model
from Database import get_db

from Model import Product_Model


router = APIRouter()


# =========================================================
# ORDER SCHEMAS
# =========================================================

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


# =========================================================
# WHATSAPP ORDER LINK
# =========================================================

def get_whatsapp_order_link(order):
    items_text = ""

    for product_id, item in order.items.items():
        items_text += (
            f"• {item.get('title', 'Product')}\n"
            f"  Quantity: {item.get('quantity', 1)}\n"
            f"  Price: Rs.{item.get('price', 0)}\n"
            f"  Subtotal: Rs.{item.get('subtotal', 0)}\n\n"
        )

    text = (
        f"🛍️ ELECTRA - New Order\n\n"
        f"Order ID: #{order.id}\n\n"

        f"👤 Customer: {order.customer_name}\n"
        f"📧 Email: {order.customer_email}\n\n"

        f"📦 Products:\n"
        f"{items_text}"

        f"💰 Total: Rs.{order.total_amount}\n\n"

        f"Please process this order."
    )

    # Your WhatsApp number
    # Country code +92, without +
    phone = "923264243320"

    return (
        f"https://wa.me/{phone}"
        f"?text={urllib.parse.quote(text)}"
    )


# =========================================================
# CREATE ORDER
# =========================================================

@router.post("/orders")
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    try:

        # -------------------------------------------------
        # CHECK STOCK FOR ALL PRODUCTS FIRST
        # -------------------------------------------------

        for product_id, item in order.items.items():

            product = (
                db.query(Product_Model.product)
                .filter(
                    Product_Model.product.id == int(product_id)
                )
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with ID {product_id} not found."
                )

            requested_quantity = int(
                item.get("quantity", 0)
            )

            if requested_quantity < 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid quantity for {product.title}."
                )

            if product.stock < requested_quantity:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Not enough stock for {product.title}. "
                        f"Only {product.stock} available."
                    )
                )

        # -------------------------------------------------
        # REDUCE STOCK
        # -------------------------------------------------

        for product_id, item in order.items.items():

            product = (
                db.query(Product_Model.product)
                .filter(
                    Product_Model.product.id == int(product_id)
                )
                .first()
            )

            requested_quantity = int(
                item.get("quantity", 0)
            )

            product.stock -= requested_quantity

        # -------------------------------------------------
        # CREATE ORDER
        # -------------------------------------------------

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

        # Commit order + stock changes together
        db.commit()

        db.refresh(new_order)

        # -------------------------------------------------
        # WHATSAPP ORDER LINK
        # -------------------------------------------------

        whatsapp_link = get_whatsapp_order_link(
            new_order
        )

        return {
            "message": "Order created successfully",
            "order_id": new_order.id,
            "whatsapp_link": whatsapp_link,
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError as e:

        db.rollback()

        print(
            "Order creation error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create order"
        )

    except Exception as e:

        db.rollback()

        print(
            "Unexpected order creation error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create order"
        )

# =========================================================
# GET SINGLE ORDER
# =========================================================

@router.get("/orders/{order_id}")
async def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order_Model.Order)
        .filter(
            Order_Model.Order.id == order_id
        )
        .first()
    )

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order


# =========================================================
# UPDATE ORDER
# =========================================================

@router.put("/orders/{order_id}")
async def update_order(
    order_id: int,
    updated_order: OrderUpdate,
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order_Model.Order)
        .filter(
            Order_Model.Order.id == order_id
        )
        .first()
    )

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    try:

        # Update only provided fields

        if updated_order.customer_name is not None:

            order.customer_name = (
                updated_order.customer_name
            )

        if updated_order.customer_email is not None:

            order.customer_email = (
                updated_order.customer_email
            )

        if updated_order.items is not None:

            order.items = (
                updated_order.items
            )

        if updated_order.total_amount is not None:

            order.total_amount = (
                updated_order.total_amount
            )

        if updated_order.status is not None:

            order.status = (
                updated_order.status
            )

        order.updated_at = datetime.now()

        db.commit()

        db.refresh(order)

        return {
            "message": "Order updated successfully",
            "order_id": order.id,
        }

    except SQLAlchemyError as e:

        db.rollback()

        print(
            "Order update error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update order"
        )


# =========================================================
# DELETE ORDER
# =========================================================

@router.delete("/orders/{order_id}")
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order_Model.Order)
        .filter(
            Order_Model.Order.id == order_id
        )
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

        print(
            "Order delete error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete order"
        )


# =========================================================
# LIST ALL ORDERS
# =========================================================

@router.get("/orders")
async def list_orders(
    db: Session = Depends(get_db)
):

    return (
        db.query(Order_Model.Order)
        .all()
    )