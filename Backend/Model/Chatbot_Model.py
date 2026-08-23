from sqlalchemy import JSON, Column, Integer, String, Text,JSON, Float
from Database import base

class AiChatbot(base):
    __tablename__ = "AiChatbot"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(100), nullable=False, index=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)