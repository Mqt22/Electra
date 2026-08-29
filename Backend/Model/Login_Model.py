from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class Login(base):
    __tablename__ = "login"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)
    password = Column(String(255), nullable=True)
    role = Column(String (255), nullable=True,default="customer")