from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from Database import get_db
from Model.Shipping_Model import Shipping
from Model.Order_Model import Order

router = APIRouter(
    prefix="/shipping",
    tags=["Shipping"]
)


@router.post("/{order_id}")
def create_shipping(
    order_id: int,
    shipping_data: dict,
    db: Session = Depends(get_db)
):
    # Check if order exists
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Check if shipping information already exists
    existing_shipping = (
        db.query(Shipping)
        .filter(Shipping.order_id == order_id)
        .first()
    )

    if existing_shipping:
        raise HTTPException(
            status_code=400,
            detail="Shipping information already exists for this order"
        )

    shipping = Shipping(
        order_id=order_id,
        phone=shipping_data["phone"],
        address=shipping_data["address"],
        city=shipping_data["city"],
        postal_code=shipping_data.get("postal_code"),
        country=shipping_data.get("country", "Pakistan")
    )

    db.add(shipping)
    db.commit()
    db.refresh(shipping)

    return {
        "message": "Shipping information saved successfully",
        "shipping": shipping
    }


@router.get("/{order_id}")
def get_shipping(
    order_id: int,
    db: Session = Depends(get_db)
):
    shipping = (
        db.query(Shipping)
        .filter(Shipping.order_id == order_id)
        .first()
    )

    if not shipping:
        raise HTTPException(
            status_code=404,
            detail="Shipping information not found"
        )

    return shipping


@router.put("/{order_id}")
def update_shipping(
    order_id: int,
    shipping_data: dict,
    db: Session = Depends(get_db)
):
    shipping = (
        db.query(Shipping)
        .filter(Shipping.order_id == order_id)
        .first()
    )

    if not shipping:
        raise HTTPException(
            status_code=404,
            detail="Shipping information not found"
        )

    shipping.phone = shipping_data.get("phone", shipping.phone)
    shipping.address = shipping_data.get("address", shipping.address)
    shipping.city = shipping_data.get("city", shipping.city)
    shipping.postal_code = shipping_data.get(
        "postal_code",
        shipping.postal_code
    )
    shipping.country = shipping_data.get(
        "country",
        shipping.country
    )

    db.commit()
    db.refresh(shipping)

    return {
        "message": "Shipping information updated successfully",
        "shipping": shipping
    }