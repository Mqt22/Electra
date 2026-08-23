from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from Model import Profile_Model
from Database import get_db
from Model import Signup_Model

router = APIRouter()

class SignupSchema(BaseModel):
    name: str
    email: str
    password: str

# ---------------------------------------------------------
# SIGNUP
# ---------------------------------------------------------

@router.post("/signup")
def signup(
    signup: SignupSchema,
    db: Session = Depends(get_db)
):

    existing_user = db.query(Signup_Model.Signup).filter(
        Signup_Model.Signup.email == signup.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = Signup_Model.Signup(
        name=signup.name,
        email=signup.email,
        password=signup.password,
        role="customer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_profile = Profile_Model.Profile(
        name=signup.name,
        email=signup.email,
        password=signup.password,
        role="customer",
        picture=None,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Signup successful",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "password": new_user.password,
        "role" : new_user.role,
        "picture": None
    }
    