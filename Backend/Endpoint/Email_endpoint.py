from fastapi import APIRouter, Depends, HTTPException
from flask import app
from sqlalchemy.orm import Session
from Database import get_db
from Model import Email_Model as model
from pydantic import BaseModel

router = APIRouter()

class EmailSchema(BaseModel):
    email: str

# ---------------------------------------------------------
# EMAILS
# ---------------------------------------------------------

@router.post("/emails")
def create_email(
    email: EmailSchema,
    db: Session = Depends(get_db)
):
    new_email = model.Email(
        email=email.email
    )

    db.add(new_email)
    db.commit()
    db.refresh(new_email)

    return new_email