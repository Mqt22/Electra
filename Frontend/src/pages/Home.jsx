import { useEffect, useState } from "react";

import laptop from "../assets/Laptop.jpg";
import apple from "../assets/Apple.jpg";
import iphone from "../assets/iphone.jpg";
import smartwatch from "../assets/airpods.jpg";

import dell from "../assets/dell.jpg";
import iphone15 from "../assets/iphone15.jpg";
import headphones from "../assets/headphones.jpg";
import camera from "../assets/camera.jpg";

import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Camera,
} from "lucide-react";


const categories = [
  {
    name: "Mobiles",
    category: "Phones",
    icon: Smartphone,
  },
  {
    name: "Laptops",
    category: "Laptops",
    icon: Laptop,
  },
  {
    name: "Audio",
    category: "Headphones",
    icon: Headphones,
  },
  {
    name: "Wearables",
    category: "Wearables",
    icon: Watch,
  },
  {
    name: "Cameras",
    category: "Cameras",
    icon: Camera,
  },
];

const slides = [
  {
    image: laptop,
    subtitle: "SMART WEAR",
    title: "Your Life, Tracked with Precision",
    description:
      "Monitor your health, stay connected, and enjoy premium performance with our latest smartwatch collection.",
    button: "Shop Now",
  },
  {
    image: apple,
    subtitle: "SMART WEAR",
    title: "Enjoy the Future of Smart Technology",
    description:
      "Monitor your health, stay connected, and enjoy premium performance with our latest smartwatch collection.",
    button: "Shop Now",
  },
  {
    image: iphone,
    subtitle: "NEW ARRIVALS",
    title: "Technology That Fits Your Lifestyle",
    description:
      "Discover stylish wearables with advanced features and long battery life.",
    button: "Shop Now",
  },
  {
    image: smartwatch,
    subtitle: "LIMITED OFFER",
    title: "Upgrade Your Everyday Experience",
    description:
      "Premium gadgets crafted for speed, comfort and reliability.",
    button: "Shop Now",
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("http://localhost:8000/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load products:", error);
        setLoading(false);
      });

  }, []);

  const homeProducts = [
    products.find((product) => product.category === "Phones"),
    products.find((product) => product.category === "Cameras"),
    products.find((product) => product.category === "Laptops"),
    products.find((product) => product.category === "Headphones"),
  ].filter(Boolean);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slider);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-105 overflow-hidden sm:h-[75vh] lg:h-125">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${current === index
              ? "opacity-100"
              : "pointer-events-none opacity-0"
              }`}
          >
            {/* Background */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/45"></div>

            {/* Content */}
            <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-12 md:px-10 lg:px-20">
              <div className="max-w-full text-white sm:max-w-md md:max-w-xl lg:max-w-2xl">
                <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider sm:px-4 sm:py-1 sm:text-xs md:text-sm">
                  {slide.subtitle}
                </span>

                <h1 className="mt-3 wrap-break-word text-2xl font-bold leading-tight sm:mt-4 sm:text-3xl md:mt-5 md:text-5xl lg:text-6xl xl:text-7xl">
                  {slide.title}
                </h1>

                <p className="mt-3 line-clamp-3 text-xs leading-6 text-gray-200 sm:mt-4 sm:text-sm sm:leading-7 sm:line-clamp-none md:mt-5 md:text-base lg:text-lg">
                  {slide.description}
                </p>

                <button className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold transition hover:bg-blue-700 sm:mt-6 sm:px-6 sm:py-2.5 sm:text-base md:mt-8 md:px-8 md:py-3">
                  {slide.button}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-1.5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-1.5 text-xs text-white backdrop-blur transition hover:bg-white/40 active:bg-white/50 sm:left-4 sm:p-2.5 sm:text-base md:left-5 md:p-3"
        >
          ❮
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-1.5 text-xs text-white backdrop-blur transition hover:bg-white/40 active:bg-white/50 sm:right-4 sm:p-2.5 sm:text-base md:right-5 md:p-3"
        >
          ❯
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-5 sm:gap-3 md:bottom-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all ${current === index
                ? "h-1.5 w-6 bg-white sm:h-2 sm:w-8"
                : "h-1.5 w-1.5 bg-white/50 sm:h-2 sm:w-2"
                }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full bg-[#F7F9FB] py-10 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl md:text-3xl">
            Explore Categories
          </h2>

          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
              {categories.map(({ name, category, icon: Icon }, index) => (
                <Link
                  key={index}
                  to={`/shop/${encodeURIComponent(category)}`}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl bg-gray-100 px-4 py-8 transition hover:bg-blue-50 sm:py-10"
                >
                  <Icon
                    size={28}
                    className="text-gray-900 transition group-hover:text-[#255DD0]"
                    strokeWidth={1.75}
                  />

                  <span className="text-sm font-medium text-gray-900 transition group-hover:text-[#255DD0] sm:text-base">
                    {name}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}

      <section className="w-full bg-white py-10 sm:py-12 md:py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}

          <div className="mb-6 flex items-start justify-between sm:mb-8">

            <div>

              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                Best Sellers
              </h2>

              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                Our most popular hardware this month.
              </p>

            </div>

            <Link
              to="/products"
              className="ml-4 whitespace-nowrap text-sm font-medium text-[#255DD0] hover:underline sm:text-base"
            >
              View All
            </Link>

          </div>


          {/* Loading */}

          {loading && (
            <p className="text-gray-500">
              Loading products...
            </p>
          )}


          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {homeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>

      </section>
    </>
  );
};

export default Home;
