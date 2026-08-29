from sqlalchemy import Column, Integer, ForeignKey
from Database import base

class Cart(base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("Signup.id"),
        nullable=False
    )

    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)