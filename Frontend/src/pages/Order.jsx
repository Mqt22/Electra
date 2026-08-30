import React, { useEffect, useState } from "react";
import { X, Pencil, Trash2, Save, Package } from "lucide-react";
import Order_bar from "../components/Order_bar";
import { useSearchParams } from "react-router-dom";

const Order = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const highlightId = searchParams.get("highlight");
  const [highlightedOrder, setHighlightedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit popup
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8000/orders"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!highlightId || orders.length === 0) {
      return;
    }

    const orderExists = orders.some(
      (order) =>
        String(
          order.order_id ??
          order.Order_ID ??
          order.id
        ) === String(highlightId)
    );

    if (!orderExists) {
      return;
    }

    setHighlightedOrder(Number(highlightId));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = document.getElementById(
          `order-${highlightId}`
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
      setHighlightedOrder(null);
      setSearchParams({});
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    highlightId,
    orders,
    setSearchParams,
  ]);

  // ==========================================
  // FORMAT ITEMS
  // ==========================================

  const formatItems = (items) => {
    if (!items) return "No items";

    try {
      const parsedItems =
        typeof items === "string"
          ? JSON.parse(items)
          : items;

      const itemList = Array.isArray(parsedItems)
        ? parsedItems
        : Object.values(parsedItems);

      return itemList
        .map(
          (item) =>
            `${item.title || "Unknown"} × ${item.quantity || 0}`
        )
        .join(", ");
    } catch (error) {
      return "Invalid items";
    }
  };

  // ==========================================
  // OPEN EDIT POPUP
  // ==========================================

  const handleEdit = (order) => {
    let parsedItems = order.items;

    if (typeof parsedItems === "string") {
      try {
        parsedItems = JSON.parse(parsedItems);
      } catch (error) {
        console.error("Invalid order items:", error);
        parsedItems = {};
      }
    }

    const itemList = Array.isArray(parsedItems)
      ? parsedItems
      : Object.values(parsedItems || {});

    setEditingOrder({
      ...order,
      items: itemList.map((item) => ({
        product_id: item.product_id || "",
        title: item.title || "",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    });

    setShowEditPopup(true);
  };

  // ==========================================
  // CLOSE EDIT POPUP
  // ==========================================

  const closeEditPopup = () => {
    if (saving) return;

    setShowEditPopup(false);
    setEditingOrder(null);
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditingOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // UPDATE ORDER
  // ==========================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingOrder) return;

    try {
      setSaving(true);
      setError("");

      const parsedItems = editingOrder.items.map((item) => ({
        product_id: Number(item.product_id),
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const response = await fetch(
        `http://localhost:8000/orders/${editingOrder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name:
              editingOrder.customer_name,

            customer_email:
              editingOrder.customer_email,

            items: parsedItems,

            total_amount:
              Number(editingOrder.total_amount),

            status:
              editingOrder.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);

        let errorMessage = "Failed to update order";

        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((error) => {
              const field = error.loc
                ? error.loc.join(".")
                : "field";

              return `${field}: ${error.msg}`;
            })
            .join("\n");
        }

        throw new Error(errorMessage);
      }

      // Update table immediately
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === editingOrder.id
            ? {
              ...order,
              customer_name:
                editingOrder.customer_name,
              customer_email:
                editingOrder.customer_email,
              items: parsedItems,
              total_amount:
                Number(
                  editingOrder.total_amount
                ),
              status:
                editingOrder.status,
            }
            : order
        )
      );

      setShowEditPopup(false);
      setEditingOrder(null);

    } catch (err) {
      console.error(
        "Update order error:",
        err
      );

      setError(
        err.message ||
        "Failed to update order."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE ORDER
  // ==========================================

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8000/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to delete order"
        );
      }

      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) => order.id !== orderId
        )
      );

    } catch (err) {
      console.error(
        "Delete order error:",
        err
      );

      setError(
        err.message ||
        "Failed to delete order."
      );
    }
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#255DD0]" />

          <p className="mt-3 text-sm text-gray-500">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 mt-10">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customer orders and order details.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
            <Package
              size={18}
              className="text-[#255DD0]"
            />

            <span className="text-sm font-semibold text-gray-700">
              {orders.length} Orders
            </span>
          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-300 w-full">

              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer Name
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Items
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total Amount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created At
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Updated At
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-5 py-16 text-center"
                    >
                      <Package
                        size={40}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 font-medium text-gray-700">
                        No orders found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Orders will appear here after customers checkout.
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      id={`order-${order.id}`}
                      key={order.id}
                      className={`
                          border-b
                        border-slate-100
                          last:border-0
                          transition-all
                          duration-700
                        hover:bg-slate-50
                          ${highlightedOrder === order.id
                          ? "bg-blue-100 ring-2 ring-blue-500 ring-inset"
                          : ""
                        }
                        `}
                    >

                      {/* Order ID */}

                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        #{order.id}
                      </td>

                      {/* Customer Name */}

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {order.customer_name}
                      </td>

                      {/* Customer Email */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.customer_email}
                      </td>

                      {/* Items */}

                      <td className="max-w-[260px] px-5 py-4 text-sm text-gray-600">
                        <div
                          className="truncate"
                          title={formatItems(order.items)}
                        >
                          {formatItems(order.items)}
                        </div>
                      </td>

                      {/* Total */}

                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        {Number(
                          order.total_amount || 0
                        ).toLocaleString()}{" "}
                        PKR
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${String(
                            order.status || ""
                          ).toLowerCase() ===
                            "successful" ||
                            String(
                              order.status || ""
                            ).toLowerCase() ===
                            "completed"
                            ? "bg-green-100 text-green-700"
                            : String(
                              order.status || ""
                            ).toLowerCase() ===
                              "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {order.status}
                        </span>

                      </td>

                      {/* Created */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(
                          order.created_at
                        )}
                      </td>

                      {/* Updated */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(
                          order.updated_at
                        )}
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(order)
                            }
                            title="Edit Order"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-[#255DD0]"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                order.id
                              )
                            }
                            title="Delete Order"
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
          EDIT ORDER POPUP
      ===================================================== */}

      {showEditPopup && editingOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

            {/* Close */}

            <button
              type="button"
              onClick={closeEditPopup}
              disabled={saving}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {/* Header */}

            <div className="mb-6 pr-10">

              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Edit Order
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the information for Order #
                {editingOrder.id}
              </p>

            </div>

            {/* Form */}

            <form
              onSubmit={handleUpdate}
              className="space-y-5"
            >

              {/* Customer Name */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Customer Name
                </label>

                <input
                  type="text"
                  name="customer_name"
                  value={
                    editingOrder.customer_name || ""
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Customer Email */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Customer Email
                </label>

                <input
                  type="email"
                  name="customer_email"
                  value={
                    editingOrder.customer_email ||
                    ""
                  }
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Items */}

              {/* Items */}

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Order Items
                </label>

                <div className="space-y-3">
                  {editingOrder.items.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                      No items in this order.
                    </div>
                  ) : (
                    editingOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                      >
                        {/* Product Header */}

                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.title || "Unknown Product"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Product ID: #{item.product_id}
                            </p>
                          </div>

                          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-[#255DD0]">
                            Item {index + 1}
                          </span>
                        </div>

                        {/* Item Details */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                          {/* Product Name */}

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                              Product Name
                            </label>

                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updatedItems = [...editingOrder.items];

                                updatedItems[index] = {
                                  ...updatedItems[index],
                                  title: e.target.value,
                                };

                                setEditingOrder((prev) => ({
                                  ...prev,
                                  items: updatedItems,
                                }));
                              }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          {/* Price */}

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                              Price (PKR)
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => {
                                const updatedItems = [...editingOrder.items];

                                updatedItems[index] = {
                                  ...updatedItems[index],
                                  price: Number(e.target.value),
                                };

                                setEditingOrder((prev) => ({
                                  ...prev,
                                  items: updatedItems,
                                }));
                              }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          {/* Quantity */}

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const updatedItems = [...editingOrder.items];

                                updatedItems[index] = {
                                  ...updatedItems[index],
                                  quantity: Number(e.target.value),
                                };

                                setEditingOrder((prev) => ({
                                  ...prev,
                                  items: updatedItems,
                                }));
                              }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                        </div>

                        {/* Subtotal */}

                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                          <span className="text-xs font-medium text-gray-500">
                            Item Subtotal
                          </span>

                          <span className="text-sm font-bold text-gray-900">
                            {(Number(item.price) * Number(item.quantity)).toLocaleString()} PKR
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Edit the product details or quantity directly above.
                </p>
              </div>

              {/* Total Amount */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Amount
                </label>

                <input
                  type="number"
                  name="total_amount"
                  value={
                    editingOrder.total_amount || ""
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Status */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={
                    editingOrder.status || ""
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="successful">
                    Successful
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>

              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeEditPopup}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#255DD0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <Order_bar />
      </div>
    </>
  );
};

export default Order;