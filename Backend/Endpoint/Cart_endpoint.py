from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from Model import Product_Model
from Model import Cart_Model
from Database import get_db


router = APIRouter()


class CartSchema(BaseModel):
    user_id: int
    product_id: int
    quantity: int


# ---------------------------------------------------------
# ADD TO CART
# ---------------------------------------------------------

@router.post("/cart")
def add_to_cart(
    cart: CartSchema,
    db: Session = Depends(get_db)
):
    # Check quantity
    if cart.quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1"
        )

    # Get product
    product = db.query(Product_Model.product).filter(
        Product_Model.product.id == cart.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Check stock
    if product.stock <= 0:
        raise HTTPException(
            status_code=400,
            detail="This product is currently out of stock."
        )

    # Check existing cart item
    existing_cart = db.query(Cart_Model.Cart).filter(
        Cart_Model.Cart.user_id == cart.user_id,
        Cart_Model.Cart.product_id == cart.product_id
    ).first()

    if existing_cart:

        new_quantity = existing_cart.quantity + cart.quantity

        # Make sure combined quantity does not exceed stock
        if new_quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock} item{'s' if product.stock != 1 else ''} available in stock."
            )

        existing_cart.quantity = new_quantity

        db.commit()
        db.refresh(existing_cart)

        return existing_cart

    # If adding for the first time
    if cart.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} item{'s' if product.stock != 1 else ''} available in stock."
        )

    new_cart = Cart_Model.Cart(
        user_id=cart.user_id,
        product_id=cart.product_id,
        quantity=cart.quantity
    )

    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)

    return new_cart


# ---------------------------------------------------------
# GET CART
# ---------------------------------------------------------

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

                # Cart quantity
                "quantity": cart_item.quantity,

                # Current product stock
                "stock": product.stock
            })

    return result


# ---------------------------------------------------------
# UPDATE CART QUANTITY
# ---------------------------------------------------------

@router.patch("/cart/{cart_id}")
def update_cart_quantity(
    cart_id: int,
    user_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    # Check quantity
    if quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1"
        )

    # Find cart item
    cart_item = db.query(Cart_Model.Cart).filter(
        Cart_Model.Cart.id == cart_id,
        Cart_Model.Cart.user_id == user_id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    # Get the product
    product = db.query(Product_Model.product).filter(
        Product_Model.product.id == cart_item.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Check current stock
    if product.stock <= 0:
        raise HTTPException(
            status_code=400,
            detail="This product is currently out of stock."
        )

    # Make sure requested quantity does not exceed stock
    if quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} item{'s' if product.stock != 1 else ''} available in stock."
        )

    # Update quantity
    cart_item.quantity = quantity

    db.commit()
    db.refresh(cart_item)

    return cart_item


# ---------------------------------------------------------
# DELETE CART ITEM
# ---------------------------------------------------------

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