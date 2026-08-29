from sqlalchemy import JSON, Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from Database import base


class Order(base):
    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    customer_name = Column(
        String(100),
        nullable=False
    )

    customer_email = Column(
        String(100),
        nullable=False
    )

    items = Column(
        JSON,
        nullable=False
    )

    total_amount = Column(
        Float,
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="pending"
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        nullable=True,
        onupdate=func.now()
    )