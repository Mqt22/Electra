import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/Cartcontext.jsx";

const Cart = () => {
  const navigate = useNavigate();

  const { cart, setCart, refreshCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState("");

  // =========================
  // Select Item
  // =========================
  const toggleItem = (cartId) => {
    setError("");

    setSelectedItems((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId]
    );
  };

  // =========================
  // Select All
  // =========================
  const toggleAll = () => {
    setError("");

    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.cart_id));
    }
  };

  // =========================
  // Update Quantity
  // =========================
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/cart/${cartId}?quantity=${newQuantity}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const updatedItem = await response.json();

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.cart_id === cartId
            ? {
                ...item,
                quantity: updatedItem.quantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Quantity update error:", error);
    }
  };

  // =========================
  // Delete Selected
  // =========================
  const deleteSelected = async () => {
    if (selectedItems.length === 0) {
      setError("Please select an item to delete.");
      return;
    }

    try {
      setError("");

      await Promise.all(
        selectedItems.map(async (cartId) => {
          const response = await fetch(
            `http://localhost:8000/cart/${cartId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete item");
          }
        })
      );

      setCart((prevCart) =>
        prevCart.filter(
          (item) => !selectedItems.includes(item.cart_id)
        )
      );

      setSelectedItems([]);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete selected items.");
      // Re-sync with the server in case some deletes succeeded and others didn't
      refreshCart();
    }
  };

  // =========================
  // Empty Cart
  // =========================
  if (cart.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-xl text-center">

          <div className="mb-6 text-6xl">
            🛒
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl lg:text-4xl">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-sm text-gray-500 sm:text-base lg:text-lg">
            There are no items selected in your cart yet.
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="mt-7 w-full rounded-lg bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-95 sm:w-auto sm:text-base"
          >
            Continue Shopping
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Cart Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Shopping Cart
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        {/* Cart Items */}
        <div className="overflow-hidden rounded-lg border border-gray-200">

          {/* Store Header */}
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex min-w-0 items-center gap-3">

              {/* Select All */}
              <input
                type="checkbox"
                checked={
                  cart.length > 0 &&
                  selectedItems.length === cart.length
                }
                onChange={toggleAll}
                className="h-5 w-5 cursor-pointer rounded border-gray-300"
              />

              <div className="flex h-7 w-7 items-center justify-center rounded bg-purple-700 text-xs font-bold text-white">
                E
              </div>

              <span className="min-w-0 truncate text-base font-medium text-gray-800 sm:text-lg">
                Electra Store
              </span>

              <span className="hidden text-xl text-gray-400 sm:block">
                ›
              </span>

            </div>

            {/* Delete Selected */}
            <button
              onClick={deleteSelected}
              title="Delete selected items"
              className="flex h-9 w-9 items-center justify-center self-end rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:self-auto"
            >
              🗑
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:px-6">
              {error}
            </div>
          )}

          {/* Products */}
          {cart.map((item) => (
            <div
              key={item.cart_id}
              className="flex flex-col gap-5 border-b border-gray-200 p-4 last:border-b-0 sm:p-6 lg:flex-row lg:items-center"
            >

              {/* Checkbox */}
              <div>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.cart_id)}
                  onChange={() => toggleItem(item.cart_id)}
                  className="h-5 w-5 cursor-pointer rounded border-gray-300"
                />
              </div>

              {/* Product */}
              <div className="flex flex-1 gap-4">

                {/* Image */}
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden sm:h-32 sm:w-32">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Product Information */}
                <div className="min-w-0 flex-1">

                  <h2 className="text-base font-medium text-gray-900 sm:text-lg">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Category:{" "}
                    <span className="text-gray-700">
                      {item.category}
                    </span>
                  </p>

                  {/* Mobile Unit Price */}
                  <div className="mt-3 lg:hidden">
                    <p className="text-xl font-medium text-gray-900">
                      {item.price}
                    </p>
                  </div>

                </div>
              </div>

              {/* Unit Price - Desktop */}
              <div className="hidden w-36 lg:block">
                <p className="text-sm text-gray-500">
                  Unit Price
                </p>

                <p className="mt-1 text-xl font-medium text-gray-900">
                  {item.price}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-start sm:justify-end">

                <button
                  onClick={() =>
                    updateQuantity(
                      item.cart_id,
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center bg-gray-100 text-xl text-gray-500 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                <span className="flex h-12 w-12 items-center justify-center text-base">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    updateQuantity(
                      item.cart_id,
                      item.quantity + 1
                    )
                  }
                  className="flex h-12 w-12 items-center justify-center bg-gray-100 text-xl text-gray-500 hover:bg-gray-200"
                >
                  +
                </button>

              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Cart;