import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Headphones,
  Smartphone,
  Laptop,
  Camera,
  Watch,
} from "lucide-react";

const categories = [
  {
    name: "Headphones",
    path: "/shop/headphones",
    description: "Wireless & wired audio",
    icon: Headphones,
  },
  {
    name: "Phones",
    path: "/shop/phones",
    description: "Smartphones & accessories",
    icon: Smartphone,
  },
  {
    name: "Laptops",
    path: "/shop/laptops",
    description: "Work & gaming laptops",
    icon: Laptop,
  },
  {
    name: "Cameras",
    path: "/shop/cameras",
    description: "Cameras & photography",
    icon: Camera,
  },
  {
    name: "Wearable",
    path: "/shop/wearable",
    description: "Smartwatches & fitness bands",
    icon: Watch,
  },
];

const CategoriesDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);

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

    // mousedown fires before click, so this beats the toggle button's
    // own onClick handler and avoids an open/close race on the same click
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-1/2 top-full z-50 mt-4 w-130 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
    >
      <div className="mb-3 px-2">
        <h3 className="text-sm font-bold text-gray-900">
          Shop by Category
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Find the products you're looking for
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.name}
              to={category.path}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-blue-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#255DD0] transition group-hover:bg-[#255DD0] group-hover:text-white">
                <Icon size={21} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#255DD0]">
                  {category.name}
                </h4>

                <p className="mt-0.5 text-xs text-gray-500">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesDropdown;