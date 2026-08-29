import json
from Model import Product_Model
from Database import session_local


db = session_local()

try:
    # Load products.json
    with open("products.json", "r", encoding="utf-8") as file:
        data = json.load(file)

    # Get products from the new JSON structure
    products = data["products"]

    # Insert products
    for product in products:
        new_product = Product_Model.product(
            id=product["id"],
            category=product["category"],
            title=product["title"],
            price=float(str(product["price"]).replace("$", "").replace(",", "")),
            rating=float(product["rating"]),
            description=product["description"],
            image_url=product["image_url"],
            images=product.get("images", []),
            video_url=product.get("video_url", ""),
            sku=product["sku"],
            brand=product["brand"],
            stock=int(product["stock"]),
            specifications=product.get("specifications", {})
        )

        db.add(new_product)

    db.commit()

    print(f"{len(products)} products inserted successfully.")

except Exception as e:
    db.rollback()
    print(f"Error inserting products: {e}")

finally:
    db.close()