from fastapi import APIRouter, Depends, HTTPException
from flask import app
from sqlalchemy.orm import Session
from pydantic import BaseModel
from Database import get_db
from Model import Profile_Model
from utils.profile_image import save_profile_picture
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()

class ProfileSchema(BaseModel):
    name: str
    email: str
    password: str | None = None
    picture: str | None = None
    theme: str | None = "system"


class ProfileUpdateSchema(BaseModel):
    name: str | None = None
    password: str | None = None
    picture: str | None = None
    theme: str | None = None

# ---------------------------------------------------------
# CREATE PROFILE
# ---------------------------------------------------------

@router.post("/profile")
def create_profile(
    profile: ProfileSchema,
    db: Session = Depends(get_db)
):
    existing_profile = db.query(Profile_Model.Profile).filter(
        Profile_Model.Profile.email == profile.email
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    picture = None

    if profile.picture:
        picture = save_profile_picture(
            profile.picture,
            profile.email
        )

    new_profile = Profile_Model.Profile(
        name=profile.name,
        email=profile.email,
        password=profile.password,
        picture=picture,
        theme=profile.theme or "system"
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Profile created successfully",
    }


# ---------------------------------------------------------
# GET PROFILE
# ---------------------------------------------------------

@router.get("/profile/{email}")
def get_profile(
    email: str,
    db: Session = Depends(get_db)
):

    profile = db.query(Profile_Model.Profile).filter(
        Profile_Model.Profile.email == email
    ).first()

    # If profile doesn't exist, create it from Signup.
    if not profile:

        user = db.query(Profile_Model.Signup).filter(
            Profile_Model.Signup.email == email
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        profile = Profile_Model.Profile(
            name=user.name,
            email=user.email,
            password=user.password,
            picture=None,
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

    picture = profile.picture

    if picture and picture.startswith("/profile-images/"):
        picture = f"http://localhost:8000{picture}"

    return {
        "id": profile.id,
        "name": profile.name,
        "email": profile.email,
        "password": profile.password,
        "picture": picture,
    }


# ---------------------------------------------------------
# UPDATE PROFILE
# ---------------------------------------------------------

@router.put("/profile/{email}")
def update_profile(
    email: str,
    profile_data: ProfileUpdateSchema,
    db: Session = Depends(get_db)
):
    try:

        profile = db.query(Profile_Model.Profile).filter(
            Profile_Model.Profile.email == email
        ).first()

        # Create profile automatically if it doesn't exist.
        if not profile:

            user = db.query(Profile_Model.Signup).filter(
                Profile_Model.Signup.email == email
            ).first()

            if not user:
                raise HTTPException(
                    status_code=404,
                    detail="User not found"
                )

            profile = Profile_Model.Profile(
                name=user.name,
                email=user.email,
                password=user.password,
                picture=None,
            )

            db.add(profile)
            db.flush()

        user = db.query(Profile_Model.Signup).filter(
            Profile_Model.Signup.email == email
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # Update name
        if profile_data.name is not None:
            profile.name = profile_data.name
            user.name = profile_data.name

        # Update password
        if (
            profile_data.password is not None
            and profile_data.password != ""
        ):
            profile.password = profile_data.password
            user.password = profile_data.password

        # Update profile picture
        if profile_data.picture is not None:

            if profile_data.picture.startswith("data:image/"):

                saved_picture = save_profile_picture(
                    profile_data.picture,
                    email
                )

                profile.picture = saved_picture

            elif profile_data.picture.startswith("/profile-images/"):

                profile.picture = profile_data.picture

            elif (
                profile_data.picture.startswith("http://")
                or profile_data.picture.startswith("https://")
            ):

                profile.picture = profile_data.picture

        # Update theme
        if profile_data.theme is not None:
            profile.theme = profile_data.theme

        db.commit()

        db.refresh(profile)
        db.refresh(user)

        picture = profile.picture

        if picture and picture.startswith("/profile-images/"):
            picture = f"http://localhost:8000{picture}"

        return {
            "message": "Profile updated successfully",
            "profile": {
                "user_id": user.id,
                "name": profile.name,
                "email": profile.email,
                "password": profile.password,
                "picture": picture,
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError as error:
        db.rollback()

        print("PROFILE DATABASE ERROR:")
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Database error while updating profile."
        )

    except Exception as error:
        db.rollback()

        print("PROFILE UPDATE ERROR:")
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Unexpected error while updating profile."
        )
