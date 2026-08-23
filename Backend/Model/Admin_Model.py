from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class Admin(base):
    __tablename__ = "Admin"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False,unique=True)
    password = Column(String(255), nullable=True, unique=True) 
    picture = Column(String(500), nullable=True)