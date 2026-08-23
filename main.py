"""
Product Scraper — University Project
=====================================
A configurable web scraper that collects Product Title, Price, Rating and
Image (with image download) for a list of categories.

WHY IT'S "CONFIGURABLE" AND NOT "UNIVERSAL"
--------------------------------------------
Every website uses different HTML tags/classes for its product cards, so
there is no single script that scrapes ANY site out of the box. Instead,
this script separates the *logic* (fetch page -> find products -> pull
fields -> download image -> save to CSV) from the *site-specific selectors*
(kept in the SITE_PROFILES dict below). To point this at a new website,
you only need to add a new profile with the right CSS selectors — nothing
else in the code changes.

HOW TO FIND SELECTORS FOR A NEW SITE
-------------------------------------
1. Open the site in Chrome/Edge, right-click a product card -> Inspect.
2. Find the repeating container element (e.g. <div class="product-card">).
3. Inside it, note the tags/classes for the title, price, rating and image.
4. Fill those into a new entry in SITE_PROFILES.

LEGAL / ETHICAL NOTE
---------------------
Always check a site's /robots.txt and Terms of Service before scraping it.
Many large retailers (Amazon, eBay, Daraz, etc.) explicitly disallow
automated scraping and use anti-bot systems. For coursework, prefer sites
that are built for scraping practice, or your own store/demo data, or get
permission first.
"""

import os
import csv
import time
import json
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# 1. SITE PROFILES — the only part you edit when targeting a new website
# ---------------------------------------------------------------------------
# Each profile tells the scraper:
#   search_url   : a format string, {query} gets replaced with the category
#   product_sel  : CSS selector that matches EACH product card
#   title_sel    : CSS selector (relative to a product card) for the title
#   price_sel    : CSS selector for the price
#   rating_sel   : CSS selector for the rating (optional — set to None if
#                  the site doesn't show one on the listing page)
#   image_sel    : CSS selector for the <img> tag
#   image_attr   : which attribute holds the real image URL
#                  (usually "src", sometimes "data-src" for lazy-loaded imgs)

SITE_PROFILES = {
    # ------------------------------------------------------------------
    # SELF-TEST site: books.toscrape.com. This is a well-known scraping
    # sandbox with NO robots.txt restrictions (its homepage literally
    # says "We love being scraped!"), so it's safe to hit directly.
    # It only sells books (genres, not electronics), so this profile is
    # only here to prove the pipeline itself works — fetch, parse title
    # /price/rating, download the image, write CSV. Point site_key at a
    # real profile (see templates below) for your actual categories.
    # ------------------------------------------------------------------
    "demo": {
        "mode": "category_urls",
        "category_urls": {
            "mystery": "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html",
            "fiction": "https://books.toscrape.com/catalogue/category/books/fiction_10/index.html",
        },
        "product_sel": "article.product_pod",
        "title_sel": "h3 a",          # full title is in the <a title="..."> attribute
        "title_attr": "title",        # visible text is truncated, so read this attribute instead
        "price_sel": "p.price_color",
        "rating_sel": "p.star-rating",  # rating is a CSS class word: One/Two/Three/Four/Five
        "image_sel": "img",
        "image_attr": "src",
    },

    # ------------------------------------------------------------------
    # TEMPLATE A — for a site with a search box (one URL pattern handles
    # every category via a {query} placeholder).
    # ------------------------------------------------------------------
    # "my_target_site": {
    #     "mode": "search",
    #     "search_url": "https://example.com/search?q={query}",
    #     "product_sel": ".product-card",
    #     "title_sel": ".product-title",
    #     "price_sel": ".product-price",
    #     "rating_sel": ".product-rating",
    #     "image_sel": "img",
    #     "image_attr": "data-src",
    # },

    # ------------------------------------------------------------------
    # TEMPLATE B — for a site where each category is its own fixed page
    # (no search query pattern, like the demo profile above).
    # ------------------------------------------------------------------
    # "my_target_site": {
    #     "mode": "category_urls",
    #     "category_urls": {
    #         "headphones": "https://example.com/category/headphones",
    #         "laptops": "https://example.com/category/laptops",
    #     },
    #     "product_sel": ".product-card",
    #     "title_sel": ".product-title",
    #     "price_sel": ".product-price",
    #     "rating_sel": ".product-rating",
    #     "image_sel": "img",
    #     "image_attr": "data-src",
    # },
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

CATEGORIES = ["headphones", "airpods", "iphone", "laptops", "camera"]

OUTPUT_DIR = "scraped_data"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")
CSV_PATH = os.path.join(OUTPUT_DIR, "products.csv")


# ---------------------------------------------------------------------------
# 2. CORE SCRAPER LOGIC — generic, reused for every site/category
# ---------------------------------------------------------------------------

def fetch_soup(url):
    """Download a page and return a BeautifulSoup object."""
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "lxml")


def clean_text(el):
    return el.get_text(strip=True) if el else "N/A"


WORD_TO_NUM = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5}


def extract_rating(el):
    """
    Ratings are shown in wildly different ways across sites:
    - a numeric string ("4.5 out of 5")
    - a CSS class word encoding the score, e.g. class="star-rating Three"
    - a data attribute like data-rating="4.5"
    - a "star-rating" bar whose CSS width % encodes the score
    This helper handles the common cases and falls back gracefully.
    """
    if el is None:
        return "N/A"
    if el.has_attr("data-rating"):
        return el["data-rating"]
    if el.has_attr("class"):
        for cls in el["class"]:
            if cls.lower() in WORD_TO_NUM:
                return f"{WORD_TO_NUM[cls.lower()]} / 5"
    text = el.get_text(strip=True)
    if text:
        return text
    style_el = el.find("span")
    if style_el and style_el.has_attr("style") and "width" in style_el["style"]:
        try:
            pct = float(style_el["style"].split("width:")[1].split("%")[0].strip())
            return f"{round(pct / 20, 1)} / 5"  # convert % width to a 5-star score
        except (IndexError, ValueError):
            pass
    return "N/A"


def download_image(img_url, dest_folder, filename):
    os.makedirs(dest_folder, exist_ok=True)
    ext = os.path.splitext(img_url.split("?")[0])[1] or ".jpg"
    if len(ext) > 5:  # guard against weird/long "extensions"
        ext = ".jpg"
    path = os.path.join(dest_folder, filename + ext)
    try:
        resp = requests.get(img_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        with open(path, "wb") as f:
            f.write(resp.content)
        return path
    except requests.RequestException as e:
        print(f"    ! image download failed: {e}")
        return "N/A"


def scrape_category(site_key, category, limit=10):
    """Scrape one category from one site profile and return a list of dicts."""
    profile = SITE_PROFILES[site_key]
    mode = profile.get("mode", "search")

    if mode == "category_urls":
        url = profile["category_urls"].get(category)
        if not url:
            print(f"[{site_key}] Skipping '{category}' — no URL configured for this "
                  f"category on this site (available: {list(profile['category_urls'])}).")
            return []
    else:
        url = profile["search_url"].format(query=category)

    print(f"[{site_key}] Fetching '{category}' -> {url}")

    soup = fetch_soup(url)
    cards = soup.select(profile["product_sel"])[:limit]

    if not cards:
        print(f"    ! No products found — check your selectors for this site/category.")
        return []

    results = []
    for i, card in enumerate(cards, start=1):
        title_el = card.select_one(profile["title_sel"])
        title_attr = profile.get("title_attr")
        if title_attr and title_el is not None and title_el.has_attr(title_attr):
            title = title_el[title_attr]
        else:
            title = clean_text(title_el)

        price = clean_text(card.select_one(profile["price_sel"]))

        rating_el = card.select_one(profile["rating_sel"]) if profile["rating_sel"] else None
        rating = extract_rating(rating_el)

        img_el = card.select_one(profile["image_sel"])
        img_url = "N/A"
        local_image_path = "N/A"
        if img_el:
            raw = img_el.get(profile["image_attr"]) or img_el.get("src")
            if raw:
                img_url = urljoin(url, raw)
                safe_name = f"{category}_{i}".replace(" ", "_")
                local_image_path = download_image(
                    img_url, os.path.join(IMAGES_DIR, category), safe_name
                )

        results.append({
            "category": category,
            "title": title,
            "price": price,
            "rating": rating,
            "image_url": img_url,
            "local_image_path": local_image_path,
        })
        print(f"    - {title[:60]:<60} {price:<12} rating={rating}")

    return results


def save_to_csv(all_rows, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fieldnames = ["category", "title", "price", "rating", "image_url", "local_image_path"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)
    print(f"\nSaved {len(all_rows)} rows to {path}")


# ---------------------------------------------------------------------------
# 3. MAIN — loop through categories, be polite, save everything
# ---------------------------------------------------------------------------

def main(site_key="demo", categories=None, limit_per_category=10):
    categories = categories or CATEGORIES
    all_rows = []

    for category in categories:
        try:
            rows = scrape_category(site_key, category, limit=limit_per_category)
            all_rows.extend(rows)
        except requests.RequestException as e:
            print(f"    ! Failed to fetch category '{category}': {e}")
        time.sleep(2)  # be polite — don't hammer the server with requests

    save_to_csv(all_rows, CSV_PATH)

    # also dump a JSON copy — handy if you need it for further processing
    json_path = os.path.join(OUTPUT_DIR, "products.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_rows, f, indent=2, ensure_ascii=False)
    print(f"Saved JSON copy to {json_path}")


if __name__ == "__main__":
    # STEP 1 (do this first): run the self-test against books.toscrape.com
    # to confirm the pipeline works end to end (fetch -> parse -> download
    # image -> CSV). Its categories are book genres, not electronics.
    main(site_key="demo", categories=["mystery", "fiction"], limit_per_category=8)

    # STEP 2: once you've added a profile for your real target site in
    # SITE_PROFILES (see the TEMPLATE A / TEMPLATE B comments above),
    # uncomment this and point site_key at it to scrape your real
    # categories: headphones, airpods, iphone, laptops, camera.
    # main(site_key="my_target_site", categories=CATEGORIES, limit_per_category=8)