from fastapi import APIRouter, Depends, HTTPException
from flask import app
from sqlalchemy.orm import Session
from pydantic import BaseModel
from Database import get_db
from Model import Review_Model

router = APIRouter()

class ReviewSchema(BaseModel):
    product_id: int
    user_id: int
    name: str
    rating: int
    comment: str


# ---------------------------------------------------------
# REVIEWS
# ---------------------------------------------------------

@router.post("/reviews")
def create_review(
    review: ReviewSchema,
    db: Session = Depends(get_db)
):
    new_review = Review_Model.review(
        product_id=review.product_id,
        user_id=review.user_id,
        name=review.name,
        rating=review.rating,
        comment=review.comment
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review

