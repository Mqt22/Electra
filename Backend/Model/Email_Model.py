from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class Email(base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)