from Database import engine, base
from Model import Order_Model,Product_Model,Profile_Model,Admin_Model,Cart_Model,Review_Model,Email_Model,Chatbot_Model,Login_Model,Signup_Model,Profile_Model,Category_Model,Shipping_Model,Stock_Model

base.metadata.create_all(bind=engine)