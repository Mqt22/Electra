from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from utils.profile_image import save_profile_picture
from Model import Admin_Model
from Database import get_db
from pydantic import BaseModel

router = APIRouter()

class AdminSchema(BaseModel):
    name: str
    password: str
    
class AdminProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    picture: Optional[str] = None

# ---------------------------------------------------------
# Admin Login
# ---------------------------------------------------------

@router.post("/admin/login")
def admin_login(
    admin: AdminSchema,
    db: Session = Depends(get_db)
):
    admin_user = db.query(Admin_Model.Admin).filter(
        Admin_Model.Admin.name == admin.name
    ).first()

    if not admin_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin email or password"
        )

    if admin_user.password != admin.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin email or password"
        )

    return {
        "message": "Admin login successful",
        "user_id": admin_user.id,
        "name": admin_user.name,
    }


# =========================================================
# GET ADMIN PROFILE
# =========================================================

@router.get("/admin/profile/{admin_id}")
def get_admin_profile(
    admin_id: int,
    db: Session = Depends(get_db)
):
    admin = db.query(Admin_Model.Admin).filter(
        Admin_Model.Admin.id == admin_id
    ).first()

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin not found"
        )

    # Convert relative picture path to full URL
    picture = admin.picture

    if picture and picture.startswith("/profile-images/"):
        picture = f"http://localhost:8000{picture}"

    return {
        "id": admin.id,
        "name": admin.name,
        "password": admin.password,
        "picture": picture,
    }


# =========================================================
# UPDATE ADMIN PROFILE
# =========================================================

@router.put("/admin/profile/{admin_id}")
def update_admin_profile(
    admin_id: int,
    admin_data: AdminProfileUpdateSchema,
    db: Session = Depends(get_db)
):
    try:
        admin = db.query(Admin_Model.Admin).filter(
            Admin_Model.Admin.id == admin_id
        ).first()

        if not admin:
            raise HTTPException(
                status_code=404,
                detail="Admin not found"
            )

        # ---------------------------------------------
        # UPDATE NAME
        # ---------------------------------------------

        if admin_data.name is not None:
            admin.name = admin_data.name

        # ---------------------------------------------
        # UPDATE PASSWORD
        # ---------------------------------------------

        if (
            admin_data.password is not None
            and admin_data.password != ""
        ):
            admin.password = admin_data.password

        # ---------------------------------------------
        # UPDATE PROFILE PICTURE
        # ---------------------------------------------

        if admin_data.picture is not None:

            if admin_data.picture.startswith("data:image/"):

                saved_picture = save_profile_picture(
                    admin_data.picture,
                    admin.name
                )

                admin.picture = saved_picture

            elif admin_data.picture.startswith("/profile-images/"):

                admin.picture = admin_data.picture

            elif (
                admin_data.picture.startswith("http://")
                or admin_data.picture.startswith("https://")
            ):

                admin.picture = admin_data.picture

        # ---------------------------------------------
        # SAVE
        # ---------------------------------------------

        db.commit()
        db.refresh(admin)

        # Convert relative path to full URL
        picture = admin.picture

        if picture and picture.startswith("/profile-images/"):
            picture = f"http://localhost:8000{picture}"

        return {
            "message": "Admin profile updated successfully",
            "profile": {
                "id": admin.id,
                "name": admin.name,
                "password": admin.password,
                "picture": picture,
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError as error:
        db.rollback()

        print("ADMIN PROFILE DATABASE ERROR:")
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Database error while updating admin profile."
        )

    except Exception as error:
        db.rollback()

        print("ADMIN PROFILE UPDATE ERROR:")
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Unexpected error while updating admin profile."
        )
        