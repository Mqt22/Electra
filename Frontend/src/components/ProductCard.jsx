import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";

const ProductCard = ({ product, highlighted }) => {
  if (!product) return null;

  const image =
    product.image_url ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "");

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  return (
    <div
      className={`group flex h-130 flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${highlighted
        ? "border-2 border-[#255DD0] ring-4 ring-[#255DD0]/10"
        : "border border-gray-100"
        }`}
    >
      {highlighted && (
        <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-[#255DD0] px-4 py-1.5 text-xs font-bold text-white shadow-md">
          Matched Product
        </div>
      )}
      {/* Product Image */}
      <Link to={`/products/${product.id}`}>
        <div className="relative h-64 overflow-hidden bg-[#F7F8FA]">
          <img
            src={image}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />

          {/* Category */}
          {product.category && (
            <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
              {product.category}
            </span>
          )}

          {/* Stock */}
          {isOutOfStock ? (
            <span className="absolute right-3 top-3 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              Out of stock
            </span>
          ) : (
            <span className="absolute right-3 top-3 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
              In stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-5">
        {/* Brand */}
        {product.brand && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#255DD0]">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <Link to={`/products/${product.id}`}>
          <h2 className="line-clamp-2 min-h-12 text-lg font-semibold text-gray-900 transition hover:text-[#255DD0]">
            {product.title}
          </h2>
        </Link>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={16}
                className={
                  index + 1 <= Math.round(Number(product.rating || 0))
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>

          <span className="text-sm font-medium text-gray-600">
            {Number(product.rating || 0).toFixed(1)}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
            {product.description}
          </p>
        )}

        {/* Price + Cart */}
        <div className="mt-auto flex min-h-14 items-center justify-between gap-4 pt-4">

          {/* Price */}
          <div className="min-w-0 flex-1">
            <p className="whitespace-nowrap text-xl font-bold leading-none text-[#255DD0]">
              PKR {Number(product.price).toLocaleString()}
            </p>

            {product.sku && (
              <p className="mt-1 truncate text-xs text-gray-400">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {/* CTA */}
          <Link
            to={`/products/${product.id}`}
            className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${isOutOfStock
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-[#255DD0] text-white hover:bg-blue-700"
              }`}
            onClick={(e) => {
              if (isOutOfStock) {
                e.preventDefault();
              }
            }}
          >
            <ShoppingCart size={15} />
            <span>
              {isOutOfStock ? "Unavailable" : "View Product"}
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;