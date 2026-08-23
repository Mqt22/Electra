from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from flask import json
from sqlalchemy.orm import Session
from pydantic import BaseModel
from Database import get_db
from Model import Chatbot_Model
from groq import Groq
import os

load_dotenv()

router = APIRouter()

Client = Groq(
    api_key=os.environ.get("GROQ_API_KEY")
)

class AiChatbotSchema(BaseModel):
    conversation_id: str
    message: str

# ---------------------------------------------------------
# AI CHATBOT
# ---------------------------------------------------------

@router.post("/chatbot")
def create_chatbot_message(
    chatbot: AiChatbotSchema,
    db: Session = Depends(get_db)
):

    # Handle /clear command BEFORE sending anything to AI
    if chatbot.message.strip().lower() == "/clear":

        messages = (
            db.query(Chatbot_Model.AiChatbot)
            .filter(
                Chatbot_Model.AiChatbot.conversation_id
                == chatbot.conversation_id
            )
            .all()
        )

        for chat in messages:
            db.delete(chat)

        db.commit()

        return {
            "response": "Chat history cleared.",
            "cleared": True
        }

    products = db.query(Chatbot_Model.Product).all()

    products_data = [
        {
            "id": product.id,
            "category": product.category,
            "title": product.title,
            "price": product.price,
            "rating": product.rating,
            "description": product.description,
            "image_url": product.image_url,
            "images": product.images,
            "brand": product.brand,
            "sku": product.sku,
            "stock": product.stock,
            "specifications": product.specifications
        }
        for product in products
    ]

    products_json = json.dumps(products_data)

    previous_messages = (
        db.query(Chatbot_Model.AiChatbot)
        .filter(
            Chatbot_Model.AiChatbot.conversation_id
            == chatbot.conversation_id
        )
        .order_by(Chatbot_Model.AiChatbot.id)
        .all()
    )

    conversation_history = []

    for chat in previous_messages:

        conversation_history.append({
            "role": "user",
            "content": chat.message
        })

        conversation_history.append({
            "role": "assistant",
            "content": chat.response
        })

    completion = Client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": f"""
                You are a helpful e-commerce shopping assistant.

                You can only answer product-related questions using the product data provided below.

                PRODUCT DATA:
                {products_json}

                IMPORTANT RESPONSE RULES:
                - Keep responses clear and easy to read.
                - Do NOT use Markdown.
                - Do NOT use ** for bold text.
                - Do NOT use ## headings.
                - Use simple plain text.
                - For product information, put the product name on its own line.
                - Use labels such as Status:, Price:, and Key Features:.
                - Use bullet points with • when listing features.
                - Keep responses concise.
                - If a product is in stock, clearly say "In stock".
                - If a product is unavailable, clearly say "Out of stock".
                - Never invent product information.
                """
            },
            *conversation_history,
            {
                "role": "user",
                "content": chatbot.message
            }
        ]
    )

    print(products_data)

    ai_response = completion.choices[0].message.content

    new_message = Chatbot_Model.AiChatbot(
        conversation_id=chatbot.conversation_id,
        message=chatbot.message,
        response=ai_response
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message


@router.get("/chatbot/{conversation_id}")
def get_chatbot_messages(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    messages = (
        db.query(Chatbot_Model.AiChatbot)
        .filter(
            Chatbot_Model.AiChatbot.conversation_id
            == conversation_id
        )
        .order_by(Chatbot_Model.AiChatbot.id)
        .all()
    )

    return messages