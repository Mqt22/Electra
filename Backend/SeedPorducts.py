import json
import model
from Database import session_local


db = session_local()

with open("products.json", "r", encoding="utf-8") as file:
    products = json.load(file)

for product in products:
    new_product = model.product(
        id=product["id"],
        title=product["title"],
        description=product["description"],
        price=float(product["price"].replace("$", "").replace(",", "")),
        category=product["category"],
        image_url=product["image_url"],
        rating=float(product["rating"]),
        images=product["images"],
        brand=product["brand"],
        sku=product["sku"],
        stock=int(product["stock"]),
        specifications=product["specifications"]
    )

    db.add(new_product)

db.commit()
db.close()

print(f"{len(products)} products inserted successfully.")