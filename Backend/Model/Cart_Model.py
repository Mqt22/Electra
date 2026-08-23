from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class Cart(base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)