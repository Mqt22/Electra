from sqlalchemy import Column, Integer, String
from Database import base

class Category(base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    color = Column(String(100), nullable=True)
    size = Column(String(100), nullable=True)
    category_type = Column(String(100), nullable=True)