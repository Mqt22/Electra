from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class Signup(base):
    __tablename__ = "Signup"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    password = Column(String(255), nullable=True, unique=True)
    role = Column(String(50), nullable=False, default="customer")