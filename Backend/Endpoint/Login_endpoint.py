from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from Model import Signup_Model, Profile_Model, Login_Model
from Database import get_db

router = APIRouter()


class LoginSchema(BaseModel):
    email: str
    password: str


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------

@router.post("/login")
def login(
    login: LoginSchema,
    db: Session = Depends(get_db)
):
    # Check credentials from Signup table
    user = db.query(Signup_Model.Signup).filter(
        Signup_Model.Signup.email == login.email,
        Signup_Model.Signup.password == login.password
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # -----------------------------------------------------
    # SAVE USER INTO LOGIN TABLE
    # -----------------------------------------------------

    existing_login = db.query(Login_Model.Login).filter(
        Login_Model.Login.email == user.email
    ).first()

    if not existing_login:
        new_login = Login_Model.Login(
            email=user.email,
            password=user.password,
            role=user.role
        )

        db.add(new_login)
        db.commit()
        db.refresh(new_login)

    # -----------------------------------------------------
    # GET PROFILE
    # -----------------------------------------------------

    profile = db.query(Profile_Model.Profile).filter(
        Profile_Model.Profile.email == user.email
    ).first()

    picture = profile.picture if profile else None

    if picture and picture.startswith("/profile-images/"):
        picture = f"http://localhost:8000{picture}"

    # -----------------------------------------------------
    # RETURN USER
    # -----------------------------------------------------

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "picture": picture,
    }