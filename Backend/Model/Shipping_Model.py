from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func

from Database import base


class Shipping(base):
    __tablename__ = "Shipping_table"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False,
        unique=True
    )

    phone = Column(
        String(20),
        nullable=False
    )

    address = Column(
        String(255),
        nullable=False
    )

    city = Column(
        String(100),
        nullable=False
    )

    postal_code = Column(
        String(20),
        nullable=True
    )

    country = Column(
        String(100),
        nullable=False,
        default="Pakistan"
    )

    shipping_status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    tracking_number = Column(
        String(100),
        nullable=True
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