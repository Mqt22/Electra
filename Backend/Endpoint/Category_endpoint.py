from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import os

router = APIRouter()

# ---------------------------------------------------------
# PRODUCT JSON FILE
# ---------------------------------------------------------

JSON_FILE = "products.json"


# ---------------------------------------------------------
# SCHEMAS
# ---------------------------------------------------------

class CategoryCreate(BaseModel):
    name: str
    color: Optional[str] = None
    size: Optional[str] = None
    category_type: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    category_type: Optional[str] = None


# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------

def read_product_json():
    if not os.path.exists(JSON_FILE):
        raise HTTPException(
            status_code=500,
            detail="product.json not found"
        )

    try:
        with open(JSON_FILE, "r", encoding="utf-8") as file:
            return json.load(file)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Invalid product.json format"
        )


def write_product_json(data):
    try:
        with open(JSON_FILE, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4, ensure_ascii=False)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save product.json: {str(e)}"
        )


# ---------------------------------------------------------
# GET CATEGORIES
# ---------------------------------------------------------

@router.get("/categories")
def get_categories():

    data = read_product_json()

    categories = data.get("categories", [])
    products = data.get("products", [])

    # Add product count to every category
    for category in categories:

        category["products"] = sum(
            1
            for product in products
            if product.get("category") == category.get("name")
        )

    return categories


# ---------------------------------------------------------
# CREATE CATEGORY
# ---------------------------------------------------------

@router.post("/categories")
def create_category(category: CategoryCreate):

    data = read_product_json()

    categories = data.setdefault("categories", [])

    # Check duplicate category
    for existing_category in categories:

        if existing_category.get("name", "").lower() == category.name.lower():

            raise HTTPException(
                status_code=400,
                detail="Category already exists"
            )

    # Generate new ID
    if categories:
        new_id = max(
            item.get("id", 0)
            for item in categories
        ) + 1
    else:
        new_id = 1

    new_category = {
        "id": new_id,
        "name": category.name.strip(),
        "color": category.color,
        "size": category.size,
        "category_type": category.category_type
    }

    categories.append(new_category)

    write_product_json(data)

    return new_category


# ---------------------------------------------------------
# UPDATE CATEGORY
# ---------------------------------------------------------

@router.put("/categories/{category_id}")
def update_category(
    category_id: int,
    category: CategoryUpdate
):

    data = read_product_json()

    categories = data.get("categories", [])
    products = data.get("products", [])

    # Find category
    existing_category = next(
        (
            item
            for item in categories
            if item.get("id") == category_id
        ),
        None
    )

    if not existing_category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    old_name = existing_category.get("name")

    # If name is being changed
    if category.name is not None:

        new_name = category.name.strip()

        # Check duplicate
        for item in categories:

            if (
                item.get("id") != category_id
                and item.get("name", "").lower() == new_name.lower()
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Category already exists"
                )

        existing_category["name"] = new_name

        # IMPORTANT:
        # Update category name inside products too
        for product in products:

            if product.get("category") == old_name:
                product["category"] = new_name

    # Update other fields
    if category.color is not None:
        existing_category["color"] = category.color

    if category.size is not None:
        existing_category["size"] = category.size

    if category.category_type is not None:
        existing_category["category_type"] = category.category_type

    write_product_json(data)

    return existing_category


# ---------------------------------------------------------
# DELETE CATEGORY
# ---------------------------------------------------------

@router.delete("/categories/{category_id}")
def delete_category(category_id: int):

    data = read_product_json()

    categories = data.get("categories", [])
    products = data.get("products", [])

    # Find category
    existing_category = next(
        (
            item
            for item in categories
            if item.get("id") == category_id
        ),
        None
    )

    if not existing_category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    category_name = existing_category.get("name")

    # Check if category is being used
    product_count = sum(
        1
        for product in products
        if product.get("category") == category_name
    )

    if product_count > 0:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot delete category '{category_name}'. "
                f"It is being used by {product_count} product(s)."
            )
        )

    # Remove category
    categories.remove(existing_category)

    write_product_json(data)

    return {
        "message": "Category deleted successfully"
    }