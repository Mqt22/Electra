from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from Database import get_db
from Model import Login_Model

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
    user = db.query(Login_Model.Login).filter(
        Login_Model.Login.email == login.email,
        Login_Model.Login.password == login.password
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    profile = db.query(Login_Model.Profile).filter(
        Login_Model.Profile.email == login.email
    ).first()

    picture = profile.picture if profile else None

    if picture and picture.startswith("/profile-images/"):
        picture = f"http://localhost:8000{picture}"

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "role": user.role,
        "picture": picture,
    }