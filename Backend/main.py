from utils.profile_image import save_profile_picture, PROFILE_IMAGES_DIR
from Endpoint.Review_endpoint import router as review_router
from Endpoint.Email_endpoint import router as email_router
from Endpoint.Cart_endpoint import router as cart_router
from Endpoint.Login_endpoint import router as login_router
from Endpoint.Products_endpoint import router as products_router
from Endpoint.Signup_endpoint import router as signup_router
from Endpoint.Chatbot_endpoint import router as chatbot_router
from Endpoint.Profile_endpoint import router as profile_router
from Endpoint.Admin_endpoint import router as admin_router
from Endpoint.Order_endpoint import router as order_router
from Endpoint.Dashboard_endpoint import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware
from Endpoint.Category_endpoint import router as category_router
from Endpoint.Shipping_endpoint import router as shipping_router
from Endpoint.Stock_endpoint import router as stock_router
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn
import os

load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# PROFILE IMAGE STORAGE
# ---------------------------------------------------------

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.include_router(products_router)
app.include_router(review_router)
app.include_router(email_router)
app.include_router(cart_router)
app.include_router(chatbot_router)
app.include_router(signup_router)
app.include_router(login_router)
app.include_router(profile_router)
app.include_router(admin_router)
app.include_router(order_router)
app.include_router(dashboard_router)
app.include_router(category_router)
app.include_router(shipping_router)
app.include_router(stock_router)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=os.environ.get("HOST", "localhost"),
        port=int(os.environ.get("PORT", "8000"))
    )