import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Order_bar = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8000/orders"
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch orders: ${response.status}`
          );
        }

        const data = await response.json();

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Failed to fetch orders:",
          err
        );

        setError(
          "Failed to load revenue data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // CHECK SUCCESSFUL ORDER
  // ==========================================

  const isSuccessfulOrder = (order) => {
    const status = String(
      order.status || ""
    ).toLowerCase();

    return (
      status === "successful" ||
      status === "success" ||
      status === "completed"
    );
  };

  // ==========================================
  // CHECK DATE FILTER
  // ==========================================

  const isInsideFilter = (date) => {
    const now = new Date();

    // -------------------------------
    // WEEKLY
    // -------------------------------

    if (filter === "weekly") {
      const currentDay = now.getDay();

      // Make Monday the first day
      const mondayOffset =
        currentDay === 0
          ? 6
          : currentDay - 1;

      const startOfWeek =
        new Date(now);

      startOfWeek.setDate(
        now.getDate() - mondayOffset
      );

      startOfWeek.setHours(
        0,
        0,
        0,
        0
      );

      return date >= startOfWeek;
    }

    // -------------------------------
    // MONTHLY
    // -------------------------------

    if (filter === "monthly") {
      return (
        date.getFullYear() ===
          now.getFullYear() &&
        date.getMonth() ===
          now.getMonth()
      );
    }

    // -------------------------------
    // YEARLY
    // -------------------------------

    if (filter === "yearly") {
      return (
        date.getFullYear() ===
        now.getFullYear()
      );
    }

    return true;
  };

  // ==========================================
  // CREATE PRODUCT REVENUE DATA
  // ==========================================

  const chartData = useMemo(() => {
    const revenueMap = {};

    orders.forEach((order) => {
      // Only successful orders
      if (!isSuccessfulOrder(order)) {
        return;
      }

      // Get order date
      const orderDate = new Date(
        order.created_at
      );

      if (
        Number.isNaN(
          orderDate.getTime()
        )
      ) {
        return;
      }

      // Apply weekly/monthly/yearly filter
      if (
        !isInsideFilter(orderDate)
      ) {
        return;
      }

      let items = order.items;

      // JSON may sometimes arrive as string
      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch (error) {
          console.error(
            "Invalid order items JSON:",
            error
          );

          return;
        }
      }

      if (!items) {
        return;
      }

      // Your backend stores items as an object:
      //
      // {
      //   "4": {
      //      product_id: 4,
      //      title: "Electra Phone Lite",
      //      price: 399,
      //      quantity: 2
      //   }
      // }

      const itemList = Array.isArray(items)
        ? items
        : Object.values(items);

      itemList.forEach((item) => {
        const productName =
          item.title ||
          item.product_name ||
          "Unknown Product";

        const price = Number(
          item.price || 0
        );

        const quantity = Number(
          item.quantity || 0
        );

        const revenue =
          price * quantity;

        if (!revenueMap[productName]) {
          revenueMap[productName] = 0;
        }

        revenueMap[productName] += revenue;
      });
    });

    return Object.entries(revenueMap)
      .map(
        ([product, revenue]) => ({
          product,
          revenue,
        })
      )
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      );
  }, [orders, filter]);

  // ==========================================
  // TOTAL REVENUE
  // ==========================================

  const totalRevenue = chartData.reduce(
    (total, item) =>
      total + item.revenue,
    0
  );

  // ==========================================
  // PERIOD TEXT
  // ==========================================

  const periodText = {
    weekly: "This week",
    monthly: "This month",
    yearly: "This year",
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex h-[400px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#255DD0]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading revenue data...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex h-[400px] items-center justify-center">

          <div className="text-center">

            <p className="font-medium text-red-500">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-3 rounded-lg bg-[#255DD0] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-xl font-bold text-gray-900">
            Revenue by Product
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Product revenue generated from successful orders
          </p>

        </div>

        {/* =====================================
            FILTER
        ====================================== */}

        <div className="flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1">

          <button
            type="button"
            onClick={() =>
              setFilter("weekly")
            }
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              filter === "weekly"
                ? "bg-[#255DD0] text-white shadow-sm"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            Weekly
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("monthly")
            }
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              filter === "monthly"
                ? "bg-[#255DD0] text-white shadow-sm"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("yearly")
            }
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              filter === "yearly"
                ? "bg-[#255DD0] text-white shadow-sm"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            Yearly
          </button>

        </div>

      </div>

      {/* =====================================
          TOTAL REVENUE
      ====================================== */}

      <div className="mt-6 rounded-xl bg-gray-50 p-5">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm font-medium text-gray-500">
              Total Revenue
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalRevenue.toLocaleString()}
              <span className="ml-2 text-sm font-medium text-gray-500">
                PKR
              </span>
            </p>

          </div>

          <div className="rounded-lg bg-[#255DD0] px-3 py-2 text-xs font-semibold text-white">
            {periodText[filter]}
          </div>

        </div>

      </div>

      {/* =====================================
          CHART
      ====================================== */}

      <div className="mt-6 h-[400px] w-full">

        {chartData.length === 0 ? (

          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <p className="font-medium text-gray-700">
                No revenue found
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Successful orders for{" "}
                {periodText[filter].toLowerCase()}{" "}
                will appear here.
              </p>

            </div>

          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 80,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="product"
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={90}
                tickLine={false}
                axisLine={{
                  stroke: "#e5e7eb",
                }}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
                tickFormatter={(value) =>
                  value.toLocaleString()
                }
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(37, 93, 208, 0.06)",
                }}
                formatter={(value) => [
                  `${Number(
                    value
                  ).toLocaleString()} PKR`,
                  "Revenue",
                ]}
                labelFormatter={(label) =>
                  `Product: ${label}`
                }
                contentStyle={{
                  borderRadius: "12px",
                  border:
                    "1px solid #e5e7eb",
                  backgroundColor:
                    "#ffffff",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)",
                }}
              />

              <Bar
                dataKey="revenue"
                fill="#255DD0"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={60}
              />

            </BarChart>

          </ResponsiveContainer>

        )}

      </div>

    </div>
  );
};

export default Order_bar;