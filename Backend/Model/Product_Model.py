from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class product(base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    rating = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    image_url = Column(String(255), nullable=False)
    images = Column(JSON, nullable=False)
    brand = Column(String(255), nullable=False)
    sku = Column(String(255), nullable=False)
    stock = Column(Integer, nullable=False)
    specifications = Column(JSON, nullable=False)