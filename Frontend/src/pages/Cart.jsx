import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  X,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "../context/Cartcontext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cart,
    setCart,
    refreshCart,
    userId,
  } = useCart();

  const { user } = useAuth();

  const [selectedItems, setSelectedItems] =
    useState([]);

  const [error, setError] = useState("");

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [showOrderPopup, setShowOrderPopup] =
    useState(false);

  const [successfulOrder, setSuccessfulOrder] = useState(null);

  const [orderId, setOrderId] = useState(null);

  // =========================
  // Selected Cart Items
  // =========================

  const selectedCartItems = cart.filter(
    (item) =>
      selectedItems.includes(item.cart_id)
  );

  // =========================
  // Selected Total
  // =========================

  const selectedTotal =
    selectedCartItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
        Number(item.quantity || 0),
      0
    );

  // =========================
  // Selected Quantity
  // =========================

  const selectedQuantity =
    selectedCartItems.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  // =========================
  // Toggle Item
  // =========================

  const toggleItem = (cartId) => {
    setError("");

    setSelectedItems((prev) =>
      prev.includes(cartId)
        ? prev.filter(
          (id) => id !== cartId
        )
        : [...prev, cartId]
    );
  };

  // =========================
  // Toggle All
  // =========================

  const toggleAll = () => {
    setError("");

    if (
      selectedItems.length ===
      cart.length
    ) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        cart.map(
          (item) => item.cart_id
        )
      );
    }
  };

  // =========================
  // Update Quantity
  // =========================

  const updateQuantity = async (
    cartId,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8000/cart/${cartId}?user_id=${userId}&quantity=${newQuantity}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        console.error(
          "Quantity update error:",
          errorData
        );

        throw new Error(
          "Failed to update quantity"
        );
      }

      const updatedItem =
        await response.json();

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.cart_id === cartId
            ? {
              ...item,
              quantity:
                updatedItem.quantity,
            }
            : item
        )
      );

    } catch (error) {
      console.error(
        "Quantity update error:",
        error
      );

      setError(
        "Failed to update quantity."
      );
    }
  };

  // =========================
  // Delete Selected
  // =========================

  const deleteSelected = async () => {
    if (selectedItems.length === 0) {
      setError(
        "Please select an item to delete."
      );

      return;
    }

    if (!userId) {
      setError(
        "User not found. Please log in again."
      );

      return;
    }

    try {
      setError("");

      await Promise.all(
        selectedItems.map(
          async (cartId) => {
            const response =
              await fetch(
                `http://localhost:8000/cart/${cartId}?user_id=${userId}`,
                {
                  method: "DELETE",
                }
              );

            if (!response.ok) {
              const errorData =
                await response.json();

              console.error(
                "Delete API error:",
                errorData
              );

              throw new Error(
                "Failed to delete item"
              );
            }
          }
        )
      );

      setCart((prevCart) =>
        prevCart.filter(
          (item) =>
            !selectedItems.includes(
              item.cart_id
            )
        )
      );

      setSelectedItems([]);

    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setError(
        "Failed to delete selected items."
      );

      refreshCart();
    }
  };

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleCheckout = async () => {
    if (
      selectedCartItems.length === 0
    ) {
      setError(
        "Please select at least one item to checkout."
      );

      return;
    }

    const customer = user;

    if (!customer) {
      setError(
        "Customer information is missing. Please log in again."
      );

      return;
    }

    if (!userId) {
      setError(
        "User not found. Please log in again."
      );

      return;
    }

    setCheckoutLoading(true);
    setError("");

    try {
      // =========================
      // Build Order Items
      // =========================

      const orderItems = {};

      selectedCartItems.forEach(
        (item) => {
          orderItems[
            String(item.product_id)
          ] = {
            product_id:
              item.product_id,

            title: item.title,

            price: Number(
              item.price
            ),

            quantity: Number(
              item.quantity
            ),

            category:
              item.category,

            image_url:
              item.image_url || null,
          };
        }
      );

      // =========================
      // Create Order
      // =========================

      const response = await fetch(
        "http://localhost:8000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customer_name:
              user.name,

            customer_email:
              user.email,

            items: orderItems,

            total_amount:
              selectedTotal,

            status: "successful",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to create order"
        );
      }

      // =========================
      // Delete Purchased Cart Items
      // =========================

      await Promise.all(
        selectedCartItems.map(
          async (item) => {
            const deleteResponse =
              await fetch(
                `http://localhost:8000/cart/${item.cart_id}?user_id=${userId}`,
                {
                  method: "DELETE",
                }
              );

            if (
              !deleteResponse.ok
            ) {
              throw new Error(
                "Order created but failed to remove cart item."
              );
            }
          }
        )
      );

      // =========================
      // Save Successful Order
      // =========================

      setSuccessfulOrder({
        items: selectedCartItems,
        total: selectedTotal,
      });

      // =========================
      // Update Local Cart
      // =========================

      setCart((prevCart) =>
        prevCart.filter(
          (item) =>
            !selectedItems.includes(
              item.cart_id
            )
        )
      );

      setSelectedItems([]);

      // =========================
      // Show Popup
      // =========================

      setOrderId(data.order_id);
      setShowOrderPopup(true);
      console.log("ORDER SUCCESS");
      console.log("Order ID:", data.order_id);
      console.log("Successful Order:", selectedCartItems);

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setError(
        error.message ||
        "Failed to place order."
      );

    } finally {
      setCheckoutLoading(false);
    }
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cart.length === 0 && !showOrderPopup) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">

        <div className="w-full max-w-xl text-center">

          <div className="mb-6 flex justify-center text-gray-300">
            <ShoppingBag size={70} />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl lg:text-4xl">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-sm text-gray-500 sm:text-base lg:text-lg">
            There are no items in your
            cart yet.
          </p>

          <button
            onClick={() =>
              navigate("/shop")
            }
            className="mt-7 w-full rounded-lg bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-95 sm:w-auto sm:text-base"
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-6">

          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Shopping Cart
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {cart.length} item
            {cart.length !== 1
              ? "s"
              : ""}{" "}
            in your cart
          </p>

        </div>

        {/* Main Layout */}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* =====================================================
              CART
          ===================================================== */}

          <div className="overflow-hidden rounded-lg border border-gray-200">

            {/* Store Header */}

            <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <input
                  type="checkbox"
                  checked={
                    cart.length > 0 &&
                    selectedItems.length ===
                    cart.length
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

              </div>

              <button
                onClick={
                  deleteSelected
                }
                title="Delete selected items"
                className="flex h-9 w-9 items-center justify-center self-end rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:self-auto"
              >
                <Trash2 size={18} />
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
                    checked={selectedItems.includes(
                      item.cart_id
                    )}
                    onChange={() =>
                      toggleItem(
                        item.cart_id
                      )
                    }
                    className="h-5 w-5 cursor-pointer rounded border-gray-300"
                  />

                </div>

                {/* Product */}

                <div className="flex flex-1 gap-4">

                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden sm:h-32 sm:w-32">

                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-contain"
                    />

                  </div>

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

                    <div className="mt-3 lg:hidden">

                      <p className="text-xl font-medium text-gray-900">
                        {Number(
                          item.price
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>

                </div>

                {/* Unit Price */}

                <div className="hidden w-36 lg:block">

                  <p className="text-sm text-gray-500">
                    Unit Price
                  </p>

                  <p className="mt-1 text-xl font-medium text-gray-900">
                    {Number(
                      item.price
                    ).toLocaleString()}
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
                    disabled={
                      item.quantity <= 1
                    }
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

          {/* =====================================================
              CHECKOUT PANEL
          ===================================================== */}

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">

            <h2 className="text-xl font-bold text-gray-900">
              Checkout
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review your selected items
              before placing your order.
            </p>

            <div className="my-5 border-t border-gray-100" />

            {/* Selected Items */}

            <div className="space-y-4">

              {selectedCartItems.length ===
                0 ? (
                <div className="rounded-xl bg-gray-50 p-5 text-center">

                  <ShoppingBag
                    size={28}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-2 text-sm font-medium text-gray-600">
                    No items selected
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Select products from your
                    cart to checkout.
                  </p>

                </div>
              ) : (
                selectedCartItems.map(
                  (item) => (
                    <div
                      key={
                        item.cart_id
                      }
                      className="flex gap-3"
                    >

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">

                        <img
                          src={
                            item.image_url
                          }
                          alt={
                            item.title
                          }
                          className="h-full w-full object-contain"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-gray-900">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.quantity} ×{" "}
                          {Number(
                            item.price
                          ).toLocaleString()}
                        </p>

                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        {(
                          Number(
                            item.price
                          ) *
                          Number(
                            item.quantity
                          )
                        ).toLocaleString()}
                      </p>

                    </div>
                  )
                )
              )}

            </div>

            <div className="my-5 border-t border-gray-100" />

            {/* Summary */}

            <div className="space-y-3">

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Selected items
                </span>

                <span className="font-medium text-gray-900">
                  {
                    selectedCartItems.length
                  }
                </span>

              </div>

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Total quantity
                </span>

                <span className="font-medium text-gray-900">
                  {selectedQuantity}
                </span>

              </div>

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Delivery
                </span>

                <span className="font-medium text-green-600">
                  Calculated later
                </span>

              </div>

            </div>

            <div className="my-5 border-t border-gray-100" />

            <div className="flex items-end justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {selectedTotal.toLocaleString()}
                </p>

              </div>

              <span className="text-xs text-gray-400">
                PKR
              </span>

            </div>

            {/* Checkout Button */}

            <button
              type="button"
              onClick={
                handleCheckout
              }
              disabled={
                selectedItems.length ===
                0 ||
                checkoutLoading
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#255DD0] px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >

              {checkoutLoading ? (
                "Processing..."
              ) : (
                <>
                  <ShoppingBag
                    size={18}
                  />
                  Checkout
                </>
              )}

            </button>

            <p className="mt-3 text-center text-xs leading-5 text-gray-400">
              By placing this order, you
              confirm the selected products
              and quantity.
            </p>

          </aside>

        </div>

      </div>

      {/* =====================================================
          ORDER RECEIVED POPUP
      ===================================================== */}

      {showOrderPopup && successfulOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowOrderPopup(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check
                  size={34}
                  className="text-green-600"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="mt-5 text-center text-2xl font-bold text-gray-900">
              Order Successful!
            </h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              Your order has been successfully placed.
            </p>

            {/* Products */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">

              {successfulOrder.items.map((item) => (
                <div
                  key={item.cart_id}
                  className="border-b border-gray-200 py-4 first:pt-0 last:border-b-0 last:pb-0"
                >

                  {/* Product Name */}
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Product Name
                    </span>

                    <span className="text-right text-sm font-semibold text-gray-900">
                      {item.title}
                    </span>
                  </div>

                  {/* Product Quantity */}
                  <div className="mt-3 flex justify-between">
                    <span className="text-sm text-gray-500">
                      Product Quantity
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Product Price */}
                  <div className="mt-3 flex justify-between">
                    <span className="text-sm text-gray-500">
                      Product Price
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {Number(item.price).toLocaleString()} PKR
                    </span>
                  </div>

                </div>
              ))}

              {/* Total */}
              <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                <span className="text-sm font-medium text-gray-700">
                  Total
                </span>

                <span className="text-base font-bold text-gray-900">
                  {Number(successfulOrder.total).toLocaleString()} PKR
                </span>
              </div>

              {/* Status */}
              <div className="mt-4 flex justify-between">
                <span className="text-sm text-gray-500">
                  Status
                </span>

                <span className="text-sm font-bold text-green-600">
                  Successful
                </span>
              </div>

            </div>

            {/* Order ID */}
            {orderId && (
              <p className="mt-4 text-center text-sm font-semibold text-gray-800">
                Order #{orderId}
              </p>
            )}

            {/* Continue Shopping */}
            <button
              type="button"
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/shop");
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

export default Cart;