from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class Profile(base):
    __tablename__ = "Profile"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    password = Column(String(255), nullable=True)
    picture = Column(String(255), nullable=True)