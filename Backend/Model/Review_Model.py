from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class review(base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(String(255), nullable=False)