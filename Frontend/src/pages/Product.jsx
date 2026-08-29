import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  PackageCheck,
  Minus,
  Plus,
  Check,
  ShoppingCart,
  Zap,
  Info,
  X,
} from "lucide-react";

import { useCart } from "../context/Cartcontext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Product = () => {
  const { refreshCart } = useCart();
  const { user } = useAuth();

  const navigate = useNavigate();
  const { id } = useParams();

  // =========================
  // Product
  // =========================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // Product controls
  // =========================

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  // =========================
  // Order
  // =========================

  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  // =========================
  // Accordions
  // =========================

  const [openSection, setOpenSection] = useState("description");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // =========================
  // Reviews
  // =========================

  const [reviews, setReviews] = useState([]);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // =========================
  // Fetch Product
  // =========================

  useEffect(() => {
    fetch(`http://localhost:8000/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product not found");
        }

        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  // =========================
  // Images
  // =========================

  const images = useMemo(() => {
    if (!product) return [];

    const productImages = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : [];

    return productImages.length
      ? productImages
      : product.image_url
        ? [product.image_url]
        : [];
  }, [product]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  // =========================
  // Reviews
  // =========================

  const reviewCount = reviews.length;

  const averageReview =
    reviewCount > 0
      ? reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        ) / reviewCount
      : Number(product?.rating || 0);

  // =========================
  // Sections
  // =========================

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? "" : section
    );
  };

  // =========================
  // Share
  // =========================

  const handleShare = async () => {
    const shareData = {
      title: product?.title || "Product",
      text: product?.description || "",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setShareMessage("Link copied");

        setTimeout(() => {
          setShareMessage("");
        }, 1800);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  // =====================================================
  // GET CUSTOMER FROM ELECTRA_USER
  // =====================================================

  const getCustomer = () => {
    try {
      const savedUser =
        localStorage.getItem("electra_user");

      if (!savedUser) {
        return null;
      }

      const customer = JSON.parse(savedUser);

      if (!customer?.name || !customer?.email) {
        return null;
      }

      return customer;
    } catch (error) {
      console.error(
        "Failed to read customer:",
        error
      );

      return null;
    }
  };

  // =========================
  // Add To Cart
  // =========================

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.user_id,
            product_id: product.id,
            quantity,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.detail ||
            "Failed to add product to cart"
        );
      }

      await response.json();

      await refreshCart();

      navigate("/cart");
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      alert(
        error.message ||
          "Failed to add product to cart."
      );
    }
  };

  // =========================
  // BUY NOW
  // =========================

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const customer = getCustomer();

    if (!customer) {
      alert(
        "Customer information is missing. Please log in again."
      );
      return;
    }

    if (!product) {
      return;
    }

    setOrderLoading(true);
    setOrderError("");

    try {
      const totalAmount =
        Number(product.price) * quantity;

      const orderItems = {
        [String(product.id)]: {
          product_id: product.id,
          title: product.title,
          price: Number(product.price),
          quantity: quantity,
          category: product.category,
          image_url: product.image_url || null,
        },
      };

      const response = await fetch(
        "http://localhost:8000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name: customer.name,
            customer_email: customer.email,
            items: orderItems,
            total_amount: totalAmount,
            status: "pending",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create order"
        );
      }

      setOrderId(data.order_id);
      setShowOrderPopup(true);

    } catch (error) {
      console.error(
        "Buy now error:",
        error
      );

      setOrderError(
        error.message ||
          "Failed to place order."
      );
    } finally {
      setOrderLoading(false);
    }
  };

  // =========================
  // Submit Review
  // =========================

  const submitReview = async () => {
    if (
      !reviewName.trim() ||
      !reviewComment.trim()
    ) {
      alert(
        "Please fill in your name and review."
      );

      return;
    }

    setReviewSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:8000/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: Number(id),
            user_id: user?.user_id || 1,
            name: reviewName,
            rating: Number(reviewRating),
            comment: reviewComment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to submit review"
        );
      }

      const newReview =
        await response.json();

      setReviews((currentReviews) => [
        ...currentReviews,
        newReview,
      ]);

      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      setShowReviewForm(false);
      setOpenSection("reviews");

    } catch (error) {
      console.error(error);

      alert(
        "Failed to submit review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] px-6 py-24">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="h-4 w-48 rounded bg-gray-200" />

          <div className="mt-8 grid gap-10 lg:grid-cols-2">

            <div className="h-[560px] rounded-2xl bg-gray-200" />

            <div>
              <div className="h-5 w-24 rounded bg-gray-200" />

              <div className="mt-5 h-12 w-3/4 rounded bg-gray-200" />

              <div className="mt-6 h-8 w-32 rounded bg-gray-200" />

              <div className="mt-8 h-28 rounded bg-gray-200" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================
  // Product Not Found
  // =========================

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-2xl font-bold text-gray-900">
          Product not found
        </h1>

        <Link
          to="/"
          className="mt-4 inline-block font-medium text-[#255DD0] hover:underline"
        >
          ← Back to Home
        </Link>

      </div>
    );
  }

  // =========================
  // Product Information
  // =========================

  const stockValue =
    product.stock ??
    product.quantity ??
    product.inventory;

  const hasStockInfo =
    stockValue !== undefined &&
    stockValue !== null;

  const isOutOfStock =
    product.in_stock === false ||
    product.available === false ||
    (hasStockInfo &&
      Number(stockValue) <= 0);

  const brand =
    product.brand ||
    product.manufacturer;

  const sku =
    product.sku ||
    product.product_code ||
    product.id;

  const specifications =
    product.specifications &&
    typeof product.specifications === "object"
      ? Object.entries(
          product.specifications
        )
      : [];

  // =========================
  // JSX
  // =========================

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-gray-900">

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

        {/* Breadcrumb */}

        <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs text-gray-500">

          <Link
            to="/"
            className="hover:text-gray-900"
          >
            Home
          </Link>

          <span>›</span>

          <Link
            to="/products"
            className="hover:text-gray-900"
          >
            Products
          </Link>

          <span>›</span>

          <Link
            to={`/products?category=${encodeURIComponent(
              product.category
            )}`}
            className="hover:text-gray-900"
          >
            {product.category}
          </Link>

          <span>›</span>

          <span className="max-w-[280px] truncate font-medium text-gray-800">
            {product.title}
          </span>

        </nav>

        {/* Main Product Area */}

        <section className="grid overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:grid-cols-2">

          {/* Gallery */}

          <div className="border-b border-gray-100 bg-white p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">

            <div className="relative flex min-h-[430px] items-center justify-center rounded-2xl bg-[#F7F8FA] p-5 sm:min-h-[540px]">

              <img
                src={
                  images[activeImage] ||
                  product.image_url
                }
                alt={product.title}
                className="h-full max-h-[500px] w-full object-contain"
              />

              <button
                type="button"
                onClick={() =>
                  setIsWishlisted(
                    (value) => !value
                  )
                }
                className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition ${
                  isWishlisted
                    ? "border-red-200 text-red-500"
                    : "border-gray-200 text-gray-700 hover:text-red-500"
                }`}
              >
                <Heart
                  size={20}
                  className={
                    isWishlisted
                      ? "fill-current"
                      : ""
                  }
                />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="absolute right-4 top-[4.25rem] flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:text-[#255DD0]"
              >
                <Share2 size={19} />
              </button>

              {shareMessage && (
                <span className="absolute right-4 top-36 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white">
                  {shareMessage}
                </span>
              )}

              {!isOutOfStock && (
                <div className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
                  ✓ In stock
                </div>
              )}

            </div>

            {/* Thumbnails */}

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">

                {images.slice(0, 5).map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setActiveImage(index)
                      }
                      className={`flex h-20 items-center justify-center overflow-hidden rounded-xl border bg-gray-50 p-2 transition ${
                        activeImage === index
                          ? "border-[#255DD0] ring-2 ring-[#255DD0]/10"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${
                          index + 1
                        }`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  )
                )}

              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-5 text-xs text-gray-500">

              <span className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-green-600"
                />
                Secure checkout
              </span>

              <span className="flex items-center gap-2">
                <PackageCheck
                  size={16}
                  className="text-[#255DD0]"
                />
                Quality checked
              </span>

            </div>

          </div>

          {/* Product Information */}

          <div className="flex flex-col p-5 sm:p-7 lg:p-10">

            <div className="flex items-start justify-between gap-5">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wide text-[#255DD0]">
                  {product.category}
                </p>

                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl">
                  {product.title}
                </h1>

                {brand && (
                  <p className="mt-2 text-sm text-gray-500">
                    Brand:{" "}
                    <span className="font-medium text-gray-800">
                      {brand}
                    </span>
                  </p>
                )}

              </div>

              <div className="hidden shrink-0 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500 sm:block">
                SKU: {sku}
              </div>

            </div>

            {/* Rating */}

            <div className="mt-5 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-1">

                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className={
                      index + 1 <=
                      Math.round(
                        averageReview
                      )
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}

              </div>

              <span className="text-sm font-semibold text-gray-800">
                {averageReview
                  ? averageReview.toFixed(1)
                  : "0.0"}
              </span>

              <button
                type="button"
                onClick={() =>
                  setOpenSection("reviews")
                }
                className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-900"
              >
                {reviewCount}{" "}
                {reviewCount === 1
                  ? "review"
                  : "reviews"}
              </button>

            </div>

            {/* Price */}

            <div className="mt-7 border-y border-gray-100 py-6">

              <div className="flex flex-wrap items-end gap-3">

                <span className="text-4xl font-bold tracking-tight text-[#255DD0]">
                  {product.price}
                </span>

                {product.old_price && (
                  <span className="pb-1 text-lg text-gray-400 line-through">
                    {product.old_price}
                  </span>
                )}

                {product.discount && (
                  <span className="mb-1 rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                    {product.discount}% OFF
                  </span>
                )}

              </div>

              <p className="mt-2 text-xs text-gray-500">
                Final price shown at checkout.
                Taxes and delivery may vary.
              </p>

            </div>

            {/* Description */}

            <div className="mt-6">

              <h2 className="text-sm font-semibold text-gray-900">
                About this product
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {product.description}
              </p>

            </div>

            {/* Metadata */}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Category
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {product.category}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">

                <p className="text-xs text-gray-500">
                  Rating
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {averageReview
                    ? `${averageReview.toFixed(
                        1
                      )} / 5`
                    : "Not rated"}
                </p>

              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">

                <p className="text-xs text-gray-500">
                  Availability
                </p>

                <p
                  className={`mt-1 text-sm font-semibold ${
                    isOutOfStock
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of stock"
                    : "Available"}
                </p>

              </div>

            </div>

            {/* Quantity */}

            <div className="mt-7">

              <div className="flex items-center justify-between">

                <p className="text-sm font-semibold">
                  Quantity
                </p>

                {hasStockInfo &&
                  !isOutOfStock && (
                    <span className="text-xs text-gray-500">
                      {stockValue} available
                    </span>
                  )}

              </div>

              <div className="mt-2 flex w-fit items-center overflow-hidden rounded-xl border border-gray-200">

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1)
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>

                <span className="flex h-11 min-w-12 items-center justify-center border-x border-gray-200 px-4 text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() =>
                    setQuantity((q) => q + 1)
                  }
                  className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>

              </div>

            </div>

            {/* Error */}

            {orderError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {orderError}
              </div>
            )}

            {/* Main Actions */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#255DD0] px-5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <ShoppingCart size={19} />

                {isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              <button
                type="button"
                disabled={
                  isOutOfStock ||
                  orderLoading
                }
                onClick={handleBuyNow}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap size={18} />

                {orderLoading
                  ? "Processing..."
                  : "Buy Now"}
              </button>

            </div>

            {/* Delivery */}

            <div className="mt-7 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50">

              <div className="flex gap-4 p-4">
                <Truck
                  className="mt-0.5 shrink-0 text-[#255DD0]"
                  size={20}
                />

                <div>
                  <p className="text-sm font-semibold">
                    Fast & reliable delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Delivery availability and
                    estimated time are shown during
                    checkout.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4">
                <RotateCcw
                  className="mt-0.5 shrink-0 text-[#255DD0]"
                  size={20}
                />

                <div>
                  <p className="text-sm font-semibold">
                    Easy returns
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Check the store's return policy
                    before placing your order.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-[#255DD0]"
                  size={20}
                />

                <div>
                  <p className="text-sm font-semibold">
                    Secure payment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Your checkout information is
                    protected.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* Product Information */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-7">

            <h2 className="text-xl font-bold">
              Product information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Everything you need to know before
              ordering.
            </p>

          </div>

          {/* Description */}

          <div className="border-b border-gray-100">

            <button
              type="button"
              onClick={() =>
                toggleSection("description")
              }
              className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-7"
            >
              <span className="font-semibold">
                Description
              </span>

              {openSection ===
              "description" ? (
                <ChevronUp size={19} />
              ) : (
                <ChevronDown size={19} />
              )}
            </button>

            {openSection ===
              "description" && (
              <div className="px-5 pb-6 text-sm leading-7 text-gray-600 sm:px-7">
                {product.description}
              </div>
            )}

          </div>

          {/* Specifications */}

          <div className="border-b border-gray-100">

            <button
              type="button"
              onClick={() =>
                toggleSection(
                  "specifications"
                )
              }
              className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-7"
            >
              <span className="font-semibold">
                Specifications
              </span>

              {openSection ===
              "specifications" ? (
                <ChevronUp size={19} />
              ) : (
                <ChevronDown size={19} />
              )}
            </button>

            {openSection ===
              "specifications" && (
              <div className="px-5 pb-6 sm:px-7">

                {specifications.length >
                0 ? (
                  <div className="overflow-hidden rounded-xl border border-gray-100">

                    {specifications.map(
                      (
                        [key, value],
                        index
                      ) => (
                        <div
                          key={key}
                          className={`grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-3 sm:gap-4 ${
                            index % 2 === 0
                              ? "bg-gray-50"
                              : "bg-white"
                          }`}
                        >

                          <span className="font-medium capitalize text-gray-700">
                            {String(
                              key
                            ).replace(
                              /_/g,
                              " "
                            )}
                          </span>

                          <span className="sm:col-span-2 text-gray-600">
                            {Array.isArray(
                              value
                            )
                              ? value.join(
                                  ", "
                                )
                              : String(
                                  value
                                )}
                          </span>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    <Info size={18} />
                    No additional
                    specifications have
                    been added for this
                    product.
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Shipping */}

          <div className="border-b border-gray-100">

            <button
              type="button"
              onClick={() =>
                toggleSection("shipping")
              }
              className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-7"
            >
              <span className="font-semibold">
                Shipping & returns
              </span>

              {openSection ===
              "shipping" ? (
                <ChevronUp size={19} />
              ) : (
                <ChevronDown size={19} />
              )}
            </button>

            {openSection ===
              "shipping" && (
              <div className="grid gap-4 px-5 pb-6 sm:grid-cols-2 sm:px-7">

                <div className="rounded-xl border border-gray-100 p-4">
                  <Truck
                    className="text-[#255DD0]"
                    size={20}
                  />

                  <h3 className="mt-3 font-semibold">
                    Delivery
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Delivery options, charges,
                    and estimated arrival are
                    confirmed at checkout.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <RotateCcw
                    className="text-[#255DD0]"
                    size={20}
                  />

                  <h3 className="mt-3 font-semibold">
                    Returns
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Return eligibility depends
                    on the store's return policy
                    and the condition of the item.
                  </p>
                </div>

              </div>
            )}

          </div>

          {/* Reviews */}

          <div>

            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

              <button
                type="button"
                onClick={() =>
                  toggleSection("reviews")
                }
                className="flex items-center gap-3 text-left"
              >
                <span className="font-semibold">
                  Customer reviews
                </span>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {reviewCount}
                </span>

                {openSection ===
                "reviews" ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}

              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(true);
                  setOpenSection(
                    "reviews"
                  );
                }}
                className="w-full rounded-lg bg-[#255DD0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
              >
                Write a Review
              </button>

            </div>

            {openSection ===
              "reviews" && (
              <div className="border-t border-gray-100 px-5 py-6 sm:px-7">

                <div className="grid gap-5 rounded-xl bg-gray-50 p-5 sm:grid-cols-[180px_1fr]">

                  <div className="text-center sm:border-r sm:border-gray-200 sm:pr-5">

                    <div className="text-4xl font-bold">
                      {averageReview
                        ? averageReview.toFixed(
                            1
                          )
                        : "0.0"}
                    </div>

                    <div className="mt-2 flex justify-center">

                      {Array.from({
                        length: 5,
                      }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={
                              index + 1 <=
                              Math.round(
                                averageReview
                              )
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }
                          />
                        )
                      )}

                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Based on{" "}
                      {reviewCount}{" "}
                      {reviewCount === 1
                        ? "review"
                        : "reviews"}
                    </p>

                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    Customers can leave a rating
                    and written review after trying
                    the product.
                  </div>

                </div>

                <div className="mt-7">

                  {reviews.length ===
                  0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">

                      <p className="font-semibold text-gray-800">
                        No reviews yet
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Be the first customer to
                        share your experience.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-6">

                      {reviews.map(
                        (
                          review,
                          index
                        ) => (
                          <article
                            key={
                              review.id ||
                              index
                            }
                            className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                          >

                            <div className="flex flex-wrap items-center justify-between gap-3">

                              <div>

                                <p className="font-semibold text-gray-900">
                                  {review.name}
                                </p>

                                {review.date && (
                                  <p className="mt-1 text-xs text-gray-400">
                                    {review.date}
                                  </p>
                                )}

                              </div>

                              <div className="flex">

                                {Array.from({
                                  length: 5,
                                }).map(
                                  (_, i) => (
                                    <Star
                                      key={i}
                                      size={15}
                                      className={
                                        i <
                                        Number(
                                          review.rating
                                        )
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-gray-200 text-gray-200"
                                      }
                                    />
                                  )
                                )}

                              </div>

                            </div>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                              {review.comment}
                            </p>

                          </article>
                        )
                      )}

                    </div>
                  )}

                </div>

                {/* Review Form */}

                {showReviewForm && (
                  <div className="mt-7 rounded-xl border border-gray-200 bg-white p-5">

                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <h3 className="font-semibold">
                          Write a review
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Tell other shoppers what
                          you think.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowReviewForm(
                            false
                          )
                        }
                        className="text-sm text-gray-500 hover:text-gray-900"
                      >
                        Cancel
                      </button>

                    </div>

                    <input
                      type="text"
                      placeholder="Your name"
                      value={reviewName}
                      onChange={(e) =>
                        setReviewName(
                          e.target.value
                        )
                      }
                      className="mt-5 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-[#255DD0]/10"
                    />

                    <div className="mt-3">

                      <label className="mb-2 block text-sm font-medium">
                        Rating
                      </label>

                      <select
                        value={
                          reviewRating
                        }
                        onChange={(e) =>
                          setReviewRating(
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#255DD0]"
                      >
                        <option value="5">
                          5 Stars
                        </option>

                        <option value="4">
                          4 Stars
                        </option>

                        <option value="3">
                          3 Stars
                        </option>

                        <option value="2">
                          2 Stars
                        </option>

                        <option value="1">
                          1 Star
                        </option>

                      </select>

                    </div>

                    <textarea
                      rows="5"
                      placeholder="Write your review..."
                      value={
                        reviewComment
                      }
                      onChange={(e) =>
                        setReviewComment(
                          e.target.value
                        )
                      }
                      className="mt-3 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-[#255DD0]/10"
                    />

                    <button
                      type="button"
                      onClick={
                        submitReview
                      }
                      disabled={
                        reviewSubmitting
                      }
                      className="mt-4 rounded-xl bg-[#255DD0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {reviewSubmitting
                        ? "Submitting..."
                        : "Submit Review"}
                    </button>

                  </div>
                )}

              </div>
            )}

          </div>

        </section>

        {/* Bottom Trust Strip */}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {[
            {
              icon: Truck,
              title: "Reliable delivery",
              text: "Clear delivery information at checkout.",
            },
            {
              icon: ShieldCheck,
              title: "Secure checkout",
              text: "Your payment information stays protected.",
            },
            {
              icon: RotateCcw,
              title: "Easy returns",
              text: "Return options depend on the store policy.",
            },
            {
              icon: Check,
              title: "Quality products",
              text: "Product information is shown before purchase.",
            },
          ].map(
            ({
              icon: Icon,
              title,
              text,
            }) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#255DD0]/10 text-[#255DD0]">
                  <Icon size={18} />
                </div>

                <div>

                  <p className="text-sm font-semibold">
                    {title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {text}
                  </p>

                </div>

              </div>
            )
          )}

        </section>

      </div>

      {/* =====================================================
          ORDER RECEIVED POPUP
      ===================================================== */}

      {showOrderPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">

          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">

            <button
              type="button"
              onClick={() =>
                setShowOrderPopup(false)
              }
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

              <Check
                size={34}
                className="text-green-600"
              />

            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Order Received!
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your order has been successfully
              received. Thank you for shopping
              with Electra.
            </p>

            {orderId && (
              <p className="mt-3 text-sm font-semibold text-gray-800">
                Order #{orderId}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/");
              }}
              className="mt-6 w-full rounded-xl bg-[#255DD0] px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue Shopping
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default Product;