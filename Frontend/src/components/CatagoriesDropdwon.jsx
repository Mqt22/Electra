import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  Headphones,
  Smartphone,
  Laptop,
  Camera,
  Watch,
  Package,
} from "lucide-react";

const iconMap = {
  headphones: Headphones,
  phones: Smartphone,
  smartphones: Smartphone,
  laptops: Laptop,
  laptop: Laptop,
  cameras: Camera,
  camera: Camera,
  wearable: Watch,
  wearables: Watch,
};

const CategoriesDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/categories"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-1/2 top-full z-50 mt-4 w-[520px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
    >
      {/* Header */}
      <div className="mb-3 px-2">
        <h3 className="text-sm font-bold text-gray-900">
          Shop by Category
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Find the products you're looking for
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="px-2 py-6 text-center text-sm text-gray-500">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="px-2 py-6 text-center text-sm text-gray-500">
          No categories available
        </div>
      ) : (
        /* Categories */
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const categoryKey = category.name
              ?.toLowerCase()
              .trim();

            const Icon =
              iconMap[categoryKey] || Package;

            return (
              <Link
                key={category.id}
                to={`/shop/${encodeURIComponent(
                  category.name.toLowerCase()
                )}`}
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-blue-50"
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#255DD0] transition group-hover:bg-[#255DD0] group-hover:text-white">
                  <Icon size={21} />
                </div>

                {/* Category information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#255DD0]">
                    {category.name}
                  </h4>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {category.products ?? 0} products
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoriesDropdown;