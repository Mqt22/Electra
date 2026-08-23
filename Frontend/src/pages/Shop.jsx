import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import NotFound from "./NotFound.jsx";

const Shop = () => {
    const { category } = useParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8000/products");

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();

                setProducts(data);
            } catch (error) {
                console.error(error);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <p>Loading products...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    // If category exists, filter products
    // Otherwise show all products
    const filteredProducts = category
        ? products.filter(
            (product) =>
                product.category.toLowerCase() === category.toLowerCase()
        )
        : products;

    if (category && filteredProducts.length === 0) {
        return <NotFound />;
    }

    return (
        <div className="w-full min-w-0 px-4 sm:px-6 lg:px-8">

            {/* Optional heading */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {category
                        ? category.charAt(0).toUpperCase() + category.slice(1)
                        : "Shop"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {filteredProducts.length} products
                </p>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>

        </div>
    );
};

export default Shop;