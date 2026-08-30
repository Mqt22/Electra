import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import NotFound from "./NotFound.jsx";

const Shop = () => {
    const { category } = useParams();
    const [searchParams] = useSearchParams();

    const highlightId = searchParams.get("highlight");
    const searchQuery = searchParams.get("search");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Temporary highlight
    const [highlightedId, setHighlightedId] = useState(null);

    // =====================================================
    // FETCH PRODUCTS
    // =====================================================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8000/products"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();

                setProducts(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error(error);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // =====================================================
    // TEMPORARY PRODUCT HIGHLIGHT
    // =====================================================

    useEffect(() => {
        if (!highlightId) {
            setHighlightedId(null);
            return;
        }

        const id = String(highlightId);

        setHighlightedId(id);

        // Wait for products to render
        const timer = setTimeout(() => {
            const element = document.getElementById(
                `product-${id}`
            );

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, 100);

        // Remove highlight after 2 seconds
        const removeHighlightTimer = setTimeout(() => {
            setHighlightedId(null);
        }, 2000);

        return () => {
            clearTimeout(timer);
            clearTimeout(removeHighlightTimer);
        };
    }, [highlightId, products]);

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return <p>Loading products...</p>;
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
        return <p>{error}</p>;
    }

    // =====================================================
    // CATEGORY FILTER
    // =====================================================

    let filteredProducts = category
        ? products.filter(
            (product) =>
                String(product.category || "").toLowerCase() ===
                category.toLowerCase()
        )
        : products;

    // =====================================================
    // SEARCH FILTER
    // =====================================================

    if (searchQuery) {
        const query = searchQuery.toLowerCase();

        filteredProducts = filteredProducts.filter(
            (product) => {
                const title = String(
                    product.title || ""
                ).toLowerCase();

                const categoryName = String(
                    product.category || ""
                ).toLowerCase();

                const brand = String(
                    product.brand || ""
                ).toLowerCase();

                const description = String(
                    product.description || ""
                ).toLowerCase();

                return (
                    title.includes(query) ||
                    categoryName.includes(query) ||
                    brand.includes(query) ||
                    description.includes(query)
                );
            }
        );
    }

    // =====================================================
    // CATEGORY NOT FOUND
    // =====================================================

    if (
        category &&
        filteredProducts.length === 0
    ) {
        return <NotFound />;
    }

    // =====================================================
    // SHOP
    // =====================================================

    return (
        <div className="w-full min-w-0 px-4 sm:px-6 lg:px-8">

            {/* ================================================= */}
            {/* HEADING */}
            {/* ================================================= */}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {searchQuery
                        ? `Search results for "${searchQuery}"`
                        : category
                            ? category.charAt(0).toUpperCase() +
                            category.slice(1)
                            : "Shop"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {filteredProducts.length} products
                </p>
            </div>

            {/* ================================================= */}
            {/* PRODUCTS */}
            {/* ================================================= */}

            {filteredProducts.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        No products found
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Try searching for another product.
                    </p>
                </div>
            ) : (
                <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            id={`product-${product.id}`}
                        >
                            <ProductCard
                                product={product}
                                highlighted={
                                    String(product.id) ===
                                    String(highlightedId)
                                }
                            />
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
};

export default Shop;