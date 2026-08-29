from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from Model import Product_Model
from Database import get_db
from Model import Cart_Model


router = APIRouter()

class CartSchema(BaseModel):
    user_id: int
    product_id: int
    quantity: int


# ---------------------------------------------------------
# CART
# ---------------------------------------------------------

@router.post("/cart")
def add_to_cart(
    cart: CartSchema,
    db: Session = Depends(get_db)
):
    existing_cart = db.query(Cart_Model.Cart).filter(
        Cart_Model.Cart.user_id == cart.user_id,
        Cart_Model.Cart.product_id == cart.product_id
    ).first()

    if existing_cart:
        existing_cart.quantity += cart.quantity

        db.commit()
        db.refresh(existing_cart)

        return existing_cart

    new_cart = Cart_Model.Cart(
        user_id=cart.user_id,
        product_id=cart.product_id,
        quantity=cart.quantity
    )

    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)

    return new_cart


@router.get("/cart")
def get_cart(
    user_id: int,
    db: Session = Depends(get_db)
):
    cart_items = db.query(Cart_Model.Cart).filter(
        Cart_Model.Cart.user_id == user_id
    ).all()

    result = []

    for cart_item in cart_items:

        product = db.query(Product_Model.product).filter(
            Product_Model.product.id == cart_item.product_id
        ).first()

        if product:
            result.append({
                "cart_id": cart_item.id,
                "product_id": product.id,
                "title": product.title,
                "category": product.category,
                "price": product.price,
                "image_url": product.image_url,
                "quantity": cart_item.quantity
            })

    return result


@router.patch("/cart/{cart_id}")
def update_cart_quantity(
    cart_id: int,
    user_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    cart_item = db.query(Cart_Model.Cart).filter(
        Cart_Model.Cart.id == cart_id,
        Cart_Model.Cart.user_id == user_id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    if quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1"
        )

    cart_item.quantity = quantity

    db.commit()
    db.refresh(cart_item)

    return cart_item


@router.delete("/cart/{cart_id}")
def delete_cart_item(
    cart_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    cart_item = db.query(Cart_Model.Cart).filter(
        Cart_Model.Cart.id == cart_id,
        Cart_Model.Cart.user_id == user_id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Product removed from cart"
    }