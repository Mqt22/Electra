import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  X,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "../context/Cartcontext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Cart = () => {
  const navigate = useNavigate();

  const { cart, setCart } = useCart();
  const { user } = useAuth();

  const userId = user?.id ?? user?.user_id;

  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [successfulOrder, setSuccessfulOrder] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const [shippingData, setShippingData] = useState({
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Pakistan",
  });

  const selectedCartItems = cart.filter((item) =>
    selectedItems.includes(item.cart_id)
  );

  const selectedTotal = selectedCartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const selectedQuantity = selectedCartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const calculateDeliveryCharge = (amount) => {
    const subtotal = Number(amount || 0);

    if (subtotal <= 0) return 0;
    if (subtotal >= 20000) return 0;
    if (subtotal >= 10000) return 150;
    return 250;
  };

  const deliveryCharge =
    calculateDeliveryCharge(selectedTotal);

  const grandTotal =
    selectedTotal + deliveryCharge;

  const toggleItem = (cartId) => {
    setSelectedItems((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId]
    );

    setError("");
  };

  const toggleAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        cart.map((item) => item.cart_id)
      );
    }

    setError("");
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;

    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const updateQuantity = async (
    cartId,
    newQuantity
  ) => {
    if (newQuantity < 1) return;

    try {
      if (!userId) {
        setError(
          "Please login to update your cart."
        );
        return;
      }

      const response = await fetch(
        `http://localhost:8000/cart/${cartId}?user_id=${userId}&quantity=${newQuantity}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update quantity"
        );
      }

      setCart((prev) =>
        prev.map((item) =>
          item.cart_id === cartId
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to update quantity."
      );
    }
  };

  const deleteSelected = async () => {
    if (!selectedItems.length) {
      setError(
        "Please select at least one product."
      );
      return;
    }

    try {
      if (!userId) {
        setError(
          "Please login to manage your cart."
        );
        return;
      }

      for (const cartId of selectedItems) {
        const response = await fetch(
          `http://localhost:8000/cart/${cartId}?user_id=${userId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to delete cart item"
          );
        }
      }

      setCart((prev) =>
        prev.filter(
          (item) =>
            !selectedItems.includes(
              item.cart_id
            )
        )
      );

      setSelectedItems([]);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to delete selected products."
      );
    }
  };

  const handleCheckout = async () => {
    setError("");

    if (!userId) {
      setError(
        "Please login before placing an order."
      );
      return;
    }

    if (selectedCartItems.length === 0) {
      setError(
        "Please select a product before checkout."
      );
      return;
    }

    if (selectedCartItems.length !== 1) {
      setError(
        "Please select exactly one product to continue checkout."
      );
      return;
    }

    if (!shippingData.phone.trim()) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (!shippingData.address.trim()) {
      setError(
        "Please enter your shipping address."
      );
      return;
    }

    if (!shippingData.city.trim()) {
      setError(
        "Please enter your city."
      );
      return;
    }

    if (!shippingData.country.trim()) {
      setError(
        "Please enter your country."
      );
      return;
    }

    try {
      setCheckoutLoading(true);

      const orderItems = {};

      selectedCartItems.forEach((item) => {
        orderItems[item.product_id] = {
          product_id: item.product_id,
          title: item.title,
          price: Number(item.price),
          quantity: Number(item.quantity),
          subtotal:
            Number(item.price) *
            Number(item.quantity),
        };
      });

      const orderResponse = await fetch(
        "http://localhost:8000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name:
              user?.name ||
              user?.username ||
              "Customer",

            customer_email:
              user?.email || "",

            items: orderItems,

            total_amount: grandTotal,

            status: "successful",
          }),
        }
      );

      if (!orderResponse.ok) {
        const orderError =
          await orderResponse.text();

        console.error(
          "Order error:",
          orderError
        );

        throw new Error(
          "Failed to create order."
        );
      }

      const orderData =
        await orderResponse.json();

      console.log(
        "Order created:",
        orderData
      );

      const newOrderId =
        orderData.order?.id ||
        orderData.id ||
        orderData.order_id;

      if (!newOrderId) {
        console.error(
          "Order response:",
          orderData
        );

        throw new Error(
          "Order was created but order ID was not returned."
        );
      }

      const shippingResponse =
        await fetch(
          `http://localhost:8000/shipping/${newOrderId}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              phone:
                shippingData.phone.trim(),

              address:
                shippingData.address.trim(),

              city:
                shippingData.city.trim(),

              postal_code:
                shippingData.postal_code.trim() ||
                null,

              country:
                shippingData.country.trim(),
            }),
          }
        );

      if (!shippingResponse.ok) {
        const shippingError =
          await shippingResponse.text();

        console.error(
          "Shipping error:",
          shippingError
        );

        throw new Error(
          "Order was created, but shipping information could not be saved."
        );
      }

      /*
       * =====================================================
       * CREATE COMPLETE WHATSAPP ORDER MESSAGE
       * =====================================================
       */

      let itemsText = "";

      selectedCartItems.forEach((item) => {
        itemsText +=
          `• ${item.title}\n` +
          `  Quantity: ${Number(
            item.quantity || 0
          )}\n` +
          `  Price: Rs.${Number(
            item.price || 0
          ).toLocaleString()}\n` +
          `  Subtotal: Rs.${(
            Number(item.price || 0) *
            Number(item.quantity || 0)
          ).toLocaleString()}\n\n`;
      });

      const whatsappMessage =
        `🛍️ ELECTRA - New Order\n\n` +

        `━━━━━━━━━━━━━━━━━━\n` +
        `📋 ORDER INFORMATION\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +

        `Order ID: #${newOrderId}\n\n` +

        `👤 Customer: ${
          user?.name ||
          user?.username ||
          "Customer"
        }\n` +

        `📧 Email: ${
          user?.email || "N/A"
        }\n\n` +

        `📦 PRODUCTS\n\n` +
        `${itemsText}` +

        `💰 Subtotal: Rs.${selectedTotal.toLocaleString()}\n` +

        `🚚 Delivery: ${
          deliveryCharge === 0
            ? "FREE"
            : `Rs.${deliveryCharge.toLocaleString()}`
        }\n` +

        `💵 Total: Rs.${grandTotal.toLocaleString()}\n\n` +

        `━━━━━━━━━━━━━━━━━━\n` +
        `📍 SHIPPING INFORMATION\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +

        `📱 Phone: ${
          shippingData.phone.trim()
        }\n` +

        `🏠 Address: ${
          shippingData.address.trim()
        }\n` +

        `🏙️ City: ${
          shippingData.city.trim()
        }\n` +

        `📮 Postal Code: ${
          shippingData.postal_code.trim() ||
          "N/A"
        }\n` +

        `🌍 Country: ${
          shippingData.country.trim()
        }\n\n` +

        `Please process this order.`;

      /*
       * WhatsApp number
       */
      const whatsappPhone =
        "923264243320";

      /*
       * Create WhatsApp Web URL
       */
      const whatsappLink =
        `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
          whatsappMessage
        )}`;

      /*
       * Open WhatsApp with the complete
       * order + shipping information.
       */
      if (whatsappLink) {
        window.open(
          whatsappLink,
          "_blank"
        );
      }

      /*
       * Delete purchased cart item
       */
      for (const item of selectedCartItems) {
        const deleteResponse =
          await fetch(
            `http://localhost:8000/cart/${item.cart_id}?user_id=${userId}`,
            {
              method: "DELETE",
            }
          );

        if (!deleteResponse.ok) {
          console.warn(
            `Could not delete cart item ${item.cart_id}`
          );
        }
      }

      setOrderId(newOrderId);

      setSuccessfulOrder({
        subtotal: selectedTotal,
        delivery: deliveryCharge,
        total: grandTotal,
        quantity: selectedQuantity,
      });

      setCart((prev) =>
        prev.filter(
          (item) =>
            !selectedItems.includes(
              item.cart_id
            )
        )
      );

      setSelectedItems([]);

      setShowOrderPopup(true);

    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      {!cart || cart.length === 0 ? (
        <main className="min-h-screen bg-white px-4 py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-[#255DD0]">
              <ShoppingBag size={42} />
            </div>

            <h1 className="mt-6 text-3xl font-extrabold text-gray-950">
              Your Cart Is Empty
            </h1>

            <p className="mt-3 max-w-md text-gray-500">
              Looks like you haven't added anything
              to your cart yet.
            </p>

            <button
              onClick={() =>
                navigate("/shop")
              }
              className="mt-8 rounded-xl bg-[#255DD0] px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue Shopping
            </button>

          </div>
        </main>
      ) : (
        <main className="min-h-screen bg-[#F7F8FA] px-4 py-8 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-7xl">

            <div className="mb-8">

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-gray-500">
                Review your selected products before
                checkout.
              </p>

            </div>

            {error && (
              <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                <span>{error}</span>

                <button
                  onClick={() =>
                    setError("")
                  }
                  className="ml-4"
                >
                  <X size={18} />
                </button>

              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

              <section>

                <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      checked={
                        cart.length > 0 &&
                        selectedItems.length ===
                          cart.length
                      }
                      onChange={toggleAll}
                      className="h-5 w-5 accent-[#255DD0]"
                    />

                    <span className="text-sm font-semibold text-gray-800">
                      Select All
                    </span>

                  </label>

                  {selectedItems.length > 0 && (
                    <button
                      onClick={deleteSelected}
                      className="flex items-center gap-2 text-sm font-semibold text-red-500 transition hover:text-red-700"
                    >
                      <Trash2 size={17} />
                      Delete Selected
                    </button>
                  )}

                </div>

                <div className="space-y-4">

                  {cart.map((item) => {

                    const isSelected =
                      selectedItems.includes(
                        item.cart_id
                      );

                    const itemSubtotal =
                      Number(item.price || 0) *
                      Number(item.quantity || 0);

                    return (
                      <div
                        key={item.cart_id}
                        className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                          isSelected
                            ? "border-[#255DD0] ring-2 ring-[#255DD0]/10"
                            : "border-gray-100"
                        }`}
                      >

                        <div className="flex gap-4">

                          <div className="pt-2">

                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleItem(
                                  item.cart_id
                                )
                              }
                              className="h-5 w-5 accent-[#255DD0]"
                            />

                          </div>

                          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#F7F8FA] sm:h-36 sm:w-36">

                            <img
                              src={
                                item.image_url ||
                                item.image ||
                                ""
                              }
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-xs font-semibold uppercase tracking-wide text-[#255DD0]">
                              {item.category ||
                                "Product"}
                            </p>

                            <h2 className="mt-1 line-clamp-2 text-lg font-bold text-gray-950">
                              {item.title}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                              PKR{" "}
                              {Number(
                                item.price || 0
                              ).toLocaleString()}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-4">

                              <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">

                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.cart_id,
                                      Number(
                                        item.quantity
                                      ) - 1
                                    )
                                  }
                                  disabled={
                                    Number(
                                      item.quantity
                                    ) <= 1
                                  }
                                  className="px-3 py-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  -
                                </button>

                                <span className="min-w-10 text-center text-sm font-semibold text-gray-800">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.cart_id,
                                      Number(
                                        item.quantity
                                      ) + 1
                                    )
                                  }
                                  className="px-3 py-2 text-gray-600 transition hover:bg-gray-50"
                                >
                                  +
                                </button>

                              </div>

                              <p className="text-sm font-bold text-[#255DD0]">
                                PKR{" "}
                                {itemSubtotal.toLocaleString()}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

                {selectedCartItems.length === 1 && (
                  <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#255DD0]">
                        <Truck size={21} />
                      </div>

                      <div>

                        <h2 className="text-xl font-bold text-gray-950">
                          Shipping Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Enter the address where you
                          want your order delivered.
                        </p>

                      </div>

                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          name="phone"
                          id="shipping-phone"
                          value={
                            shippingData.phone
                          }
                          onChange={
                            handleShippingChange
                          }
                          autoComplete="tel"
                          placeholder="+92 300 1234567"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-[#255DD0]/10"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          City
                        </label>

                        <input
                          type="text"
                          name="city"
                          id="shipping-city"
                          value={
                            shippingData.city
                          }
                          onChange={
                            handleShippingChange
                          }
                          autoComplete="address-level2"
                          placeholder="Lahore"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-[#255DD0]/10"
                        />

                      </div>

                      <div className="sm:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Address
                        </label>

                        <input
                          type="text"
                          name="address"
                          id="shipping-address"
                          value={
                            shippingData.address
                          }
                          onChange={
                            handleShippingChange
                          }
                          autoComplete="street-address"
                          placeholder="House no, street, area"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-[#255DD0]/10"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Postal Code
                        </label>

                        <input
                          type="text"
                          name="postal_code"
                          id="shipping-postal-code"
                          value={
                            shippingData.postal_code
                          }
                          onChange={
                            handleShippingChange
                          }
                          autoComplete="postal-code"
                          placeholder="54000"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-[#255DD0]/10"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Country
                        </label>

                        <input
                          type="text"
                          name="country"
                          id="shipping-country"
                          value={
                            shippingData.country
                          }
                          onChange={
                            handleShippingChange
                          }
                          autoComplete="country-name"
                          placeholder="Pakistan"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-[#255DD0]/10"
                        />

                      </div>

                    </div>

                  </div>
                )}

                {selectedCartItems.length > 1 && (
                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                    <p className="text-sm font-semibold text-[#255DD0]">
                      Please select only one product
                      at a time for checkout.
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      Shipping information is currently
                      collected for a single selected
                      product.
                    </p>

                  </div>
                )}

              </section>

              <aside className="h-fit">

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

                  <h2 className="text-xl font-bold text-gray-950">
                    Checkout Summary
                  </h2>

                  <div className="mt-6 space-y-4">

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-gray-500">
                        Products
                      </span>

                      <span className="font-semibold text-gray-900">
                        {selectedQuantity}
                      </span>

                    </div>

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <span className="font-semibold text-gray-900">
                        PKR{" "}
                        {selectedTotal.toLocaleString()}
                      </span>

                    </div>

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-gray-500">
                        Delivery Charges
                      </span>

                      <span className="font-semibold text-gray-900">
                        {deliveryCharge === 0
                          ? "FREE"
                          : `PKR ${deliveryCharge.toLocaleString()}`}
                      </span>

                    </div>

                    <div className="border-t border-gray-100 pt-4">

                      <div className="flex items-center justify-between">

                        <span className="text-base font-bold text-gray-900">
                          Total
                        </span>

                        <span className="text-2xl font-extrabold text-[#255DD0]">
                          PKR{" "}
                          {grandTotal.toLocaleString()}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="mt-5 rounded-xl bg-[#F7F8FA] p-4">

                    <p className="text-xs leading-5 text-gray-500">
                      Delivery is automatically
                      calculated based on your order
                      subtotal.
                    </p>

                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={
                      checkoutLoading ||
                      selectedCartItems.length !== 1
                    }
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#255DD0] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >

                    {checkoutLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        <Check size={18} />
                        Place Order
                      </>
                    )}

                  </button>

                  <button
                    onClick={() =>
                      navigate("/shop")
                    }
                    className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-[#255DD0] hover:text-[#255DD0]"
                  >
                    Continue Shopping
                  </button>

                </div>

              </aside>

            </div>
          </div>
        </main>
      )}

      {showOrderPopup &&
        successfulOrder && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Check size={32} />
              </div>

              <h2 className="mt-5 text-center text-2xl font-extrabold text-gray-950">
                Order Placed Successfully!
              </h2>

              <p className="mt-2 text-center text-sm text-gray-500">
                Thank you for shopping with ELECTRA.
              </p>

              <div className="mt-6 rounded-2xl bg-[#F7F8FA] p-5">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Order ID
                  </span>

                  <span className="font-bold text-gray-900">
                    #{orderId}
                  </span>

                </div>

                <div className="mt-3 flex justify-between text-sm">

                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-gray-900">
                    PKR{" "}
                    {successfulOrder.subtotal.toLocaleString()}
                  </span>

                </div>

                <div className="mt-3 flex justify-between text-sm">

                  <span className="text-gray-500">
                    Delivery
                  </span>

                  <span className="font-semibold text-gray-900">
                    {successfulOrder.delivery ===
                    0
                      ? "FREE"
                      : `PKR ${successfulOrder.delivery.toLocaleString()}`}
                  </span>

                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">

                  <div className="flex items-center justify-between">

                    <span className="font-bold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-extrabold text-[#255DD0]">
                      PKR{" "}
                      {successfulOrder.total.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

              <button
                onClick={() => {
                  setShowOrderPopup(false);
                  navigate("/shop");
                }}
                className="mt-6 w-full rounded-xl bg-[#255DD0] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Continue Shopping
              </button>

            </div>

          </div>
        )}

    </>
  );
};

export default Cart;