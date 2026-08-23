import base64
import hashlib
import os
import re
from fastapi import HTTPException

PROFILE_IMAGES_DIR = "profile_images"

os.makedirs(PROFILE_IMAGES_DIR, exist_ok=True)

def save_profile_picture(picture_data: str, email: str):
    """
    Receives a base64 data URL from React,
    saves the actual image to profile_images/,
    and returns a short URL that can safely be stored
    in the database.
    """

    if not picture_data:
        return None

    # If an existing URL was already stored, don't process it again.
    if picture_data.startswith("/profile-images/"):
        return picture_data

    if picture_data.startswith("http://") or picture_data.startswith("https://"):
        return picture_data

    try:
        match = re.match(
            r"data:image/([a-zA-Z0-9.+-]+);base64,(.+)",
            picture_data,
            re.DOTALL
        )

        if not match:
            raise ValueError("Invalid profile image format")

        image_type = match.group(1).lower()
        image_base64 = match.group(2)

        extension_map = {
            "jpeg": "jpg",
            "jpg": "jpg",
            "png": "png",
            "webp": "webp",
            "gif": "gif"
        }

        extension = extension_map.get(image_type, "jpg")

        image_bytes = base64.b64decode(image_base64)

        safe_email = hashlib.sha256(
            email.encode("utf-8")
        ).hexdigest()[:24]

        filename = f"{safe_email}.{extension}"

        filepath = os.path.join(
            PROFILE_IMAGES_DIR,
            filename
        )

        with open(filepath, "wb") as image_file:
            image_file.write(image_bytes)

        return f"/profile-images/{filename}"

    except Exception as error:
        print("Profile image save error:", error)
        raise HTTPException(
            status_code=400,
            detail="Could not save profile picture"
        )