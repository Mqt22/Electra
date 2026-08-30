import React, { useEffect, useState } from "react";
import {
  X,
  Pencil,
  Trash2,
  Save,
  Package,
  Star,
  Plus,
} from "lucide-react";

import Product_bar from "../components/Product_bar.jsx";
import { useSearchParams } from "react-router-dom";

const Product_Page = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const highlightId = searchParams.get("highlight");
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [saving, setSaving] = useState(false);

  const [newProduct, setNewProduct] = useState({
    category: "",
    title: "",
    price: "",
    rating: 0,
    description: "",
    image_url: "",
    images: [],
    brand: "",
    sku: "",
    stock: 0,
    specifications: {},
  });

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

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
    } catch (err) {
      console.error("Fetch products error:", err);

      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/categories"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Fetch categories error:",
        err
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!highlightId || products.length === 0) {
      return;
    }

    const productExists = products.some(
      (product) =>
        String(
          product.Product_ID ??
          product.product_id ??
          product.id
        ) === String(highlightId)
    );

    if (!productExists) {
      return;
    }

    setHighlightedProduct(Number(highlightId));

    // Wait for DOM rendering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = document.getElementById(
          `product-${highlightId}`
        );

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
    });

    const timer = setTimeout(() => {
      setHighlightedProduct(null);
      setSearchParams({});
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    highlightId,
    products,
    setSearchParams,
  ]);

  // =====================================================
  // OPEN EDIT POPUP
  // =====================================================

  const handleEdit = (product) => {
    setEditingProduct({
      id: product.id,
      category: product.category || "",
      title: product.title || "",
      price: product.price ?? "",
      rating: product.rating ?? "",
      description: product.description || "",
    });

    setShowEditPopup(true);
  };

  // =====================================================
  // CLOSE EDIT POPUP
  // =====================================================

  const closeEditPopup = () => {
    if (saving) return;

    setShowEditPopup(false);
    setEditingProduct(null);
  };

  // =====================================================
  // CLOSE ADD POPUP
  // =====================================================

  const closeAddPopup = () => {
    if (saving) return;

    setShowAddPopup(false);

    setNewProduct({
      category: "",
      title: "",
      price: "",
      rating: 0,
      description: "",
      image_url: "",
      images: [],
      brand: "",
      sku: "",
      stock: 0,
      specifications: {},
    });
  };

  // =====================================================
  // EDIT INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditingProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // NEW PRODUCT INPUT CHANGE
  // =====================================================

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;

    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE PRODUCT
  // =====================================================

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "http://localhost:8000/products",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            category: newProduct.category,
            title: newProduct.title,
            price: Number(newProduct.price),
            rating: Number(newProduct.rating),
            description: newProduct.description,
            image_url: newProduct.image_url,
            images: newProduct.image_url
              ? [newProduct.image_url]
              : [],
            brand: newProduct.brand,
            sku: newProduct.sku,
            stock: Number(newProduct.stock),
            specifications: {},
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to create product"
        );
      }

      // Refresh product table
      await fetchProducts();

      closeAddPopup();
    } catch (err) {
      console.error(
        "Create product error:",
        err
      );

      setError(
        err.message ||
        "Failed to create product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `http://localhost:8000/products/${editingProduct.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            category:
              editingProduct.category,

            title:
              editingProduct.title,

            price:
              Number(editingProduct.price),

            rating:
              Number(editingProduct.rating),

            description:
              editingProduct.description,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to update product"
        );
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editingProduct.id
            ? {
              ...product,
              category:
                editingProduct.category,
              title:
                editingProduct.title,
              price:
                Number(
                  editingProduct.price
                ),
              rating:
                Number(
                  editingProduct.rating
                ),
              description:
                editingProduct.description,
            }
            : product
        )
      );

      closeEditPopup();
    } catch (err) {
      console.error(
        "Update product error:",
        err
      );

      setError(
        err.message ||
        "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8000/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to delete product"
        );
      }

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) =>
            product.id !== productId
        )
      );
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err.message ||
        "Failed to delete product."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#255DD0]" />

          <p className="mt-3 text-sm text-gray-500">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <>
      <div className="mt-10 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your products and product information.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
              <Package
                size={18}
                className="text-[#255DD0]"
              />

              <span className="text-sm font-semibold text-gray-700">
                {products.length} Products
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAddPopup(true)
              }
              className="flex items-center gap-2 rounded-lg bg-[#255DD0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Product
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-275 w-full">

              <thead>
                <tr className="border-b border-slate-100">

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product Title
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >
                      <Package
                        size={40}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 font-medium text-gray-700">
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      id={`product-${product.id}`}
                      className={`
                        border-b
                      border-gray-100
                        last:border-b-0
                        transition-all
                        duration-500
                        ease-in-out
                        ${highlightedProduct === product.id
                          ? "bg-blue-100 ring-2 ring-blue-500 ring-inset"
                          : "hover:bg-gray-50"
                        }
                      `}
                    >

                      {/* ID */}

                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        #{product.id}
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#255DD0]">
                          {product.category}
                        </span>
                      </td>

                      {/* TITLE */}

                      <td className="max-w-[230px] px-5 py-4">
                        <div
                          className="truncate text-sm font-medium text-gray-900"
                          title={product.title}
                        >
                          {product.title}
                        </div>
                      </td>

                      {/* PRICE */}

                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        {Number(
                          product.price || 0
                        ).toLocaleString()}{" "}
                        PKR
                      </td>

                      {/* RATING */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">

                          <Star
                            size={15}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          <span className="text-sm font-medium text-gray-700">
                            {Number(
                              product.rating || 0
                            ).toFixed(1)}
                          </span>

                        </div>
                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-[300px] px-5 py-4">

                        <div
                          className="truncate text-sm text-gray-600"
                          title={
                            product.description
                          }
                        >
                          {product.description}
                        </div>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                product
                              )
                            }
                            title="Edit Product"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-[#255DD0]"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                product.id
                              )
                            }
                            title="Delete Product"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          ADD PRODUCT POPUP
      ===================================================== */}

      {showAddPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeAddPopup}
              disabled={saving}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            {/* HEADER */}

            <div className="mb-6 pr-10">

              <h2 className="text-2xl font-bold text-gray-900">
                Add Product
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add a new product to your store.
              </p>

            </div>

            <form
              onSubmit={handleCreateProduct}
              className="space-y-5"
            >

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Category
                </label>

                <select
                  name="category"
                  value={newProduct.category}
                  onChange={
                    handleNewProductChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

                {categories.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    No categories available.
                    Create a category first.
                  </p>
                )}
              </div>

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={newProduct.title}
                  onChange={
                    handleNewProductChange
                  }
                  placeholder="Enter product title"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* PRICE + STOCK */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={
                      handleNewProductChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="0"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={newProduct.stock}
                    onChange={
                      handleNewProductChange
                    }
                    min="0"
                    placeholder="0"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              {/* RATING */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rating
                </label>

                <input
                  type="number"
                  name="rating"
                  value={newProduct.rating}
                  onChange={
                    handleNewProductChange
                  }
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* BRAND */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={newProduct.brand}
                  onChange={
                    handleNewProductChange
                  }
                  placeholder="e.g. Samsung"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* SKU */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SKU
                </label>

                <input
                  type="text"
                  name="sku"
                  value={newProduct.sku}
                  onChange={
                    handleNewProductChange
                  }
                  placeholder="e.g. SAM-S24-001"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* IMAGE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Image URL
                </label>

                <input
                  type="url"
                  name="image_url"
                  value={
                    newProduct.image_url
                  }
                  onChange={
                    handleNewProductChange
                  }
                  placeholder="https://example.com/product.jpg"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Description
                </label>

                <textarea
                  name="description"
                  value={
                    newProduct.description
                  }
                  onChange={
                    handleNewProductChange
                  }
                  rows={5}
                  placeholder="Enter product description..."
                  required
                  className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeAddPopup}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#255DD0] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus size={17} />
                      Add Product
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT PRODUCT POPUP
      ===================================================== */}

      {showEditPopup &&
        editingProduct && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">

            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

              <button
                type="button"
                onClick={closeEditPopup}
                disabled={saving}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pr-10">

                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Edit Product
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update Product #
                  {editingProduct.id}
                </p>

              </div>

              <form
                onSubmit={handleUpdate}
                className="space-y-5"
              >

                {/* CATEGORY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Category
                  </label>

                  <select
                    name="category"
                    value={
                      editingProduct.category
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#255DD0]"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>
                </div>

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      editingProduct.title
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0]"
                  />
                </div>

                {/* PRICE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={
                      editingProduct.price
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0]"
                  />
                </div>

                {/* RATING */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Rating
                  </label>

                  <input
                    type="number"
                    name="rating"
                    value={
                      editingProduct.rating
                    }
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0]"
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      editingProduct.description
                    }
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#255DD0]"
                  />
                </div>

                {/* BUTTONS */}

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                  <button
                    type="button"
                    onClick={closeEditPopup}
                    disabled={saving}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#255DD0] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={17} />
                        Save Changes
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* PRODUCT CHART */}

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <Product_bar />
      </div>
    </>
  );
};

export default Product_Page;