import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";

const Product_bar = () => {
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
          "Failed to load product sales data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // SUCCESSFUL ORDER
  // ==========================================

  const isSuccessfulOrder = (order) => {
    const status = String(
      order.status || ""
    ).toLowerCase().trim();

    return (
      status === "successful" ||
      status === "success" ||
      status === "completed"
    );
  };

  // ==========================================
  // FILTER DATE
  // ==========================================

  const isInsideFilter = (date) => {
    const now = new Date();

    // ------------------------------------------
    // WEEKLY
    // ------------------------------------------

    if (filter === "weekly") {
      const currentDay = now.getDay();

      const mondayOffset =
        currentDay === 0
          ? 6
          : currentDay - 1;

      const startOfWeek = new Date(now);

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

    // ------------------------------------------
    // MONTHLY
    // ------------------------------------------

    if (filter === "monthly") {
      return (
        date.getFullYear() ===
          now.getFullYear() &&
        date.getMonth() ===
          now.getMonth()
      );
    }

    // ------------------------------------------
    // YEARLY
    // ------------------------------------------

    if (filter === "yearly") {
      return (
        date.getFullYear() ===
        now.getFullYear()
      );
    }

    return true;
  };

  // ==========================================
  // PRODUCT SALES DATA
  // ==========================================

  const chartData = useMemo(() => {
    const productMap = {};

    orders.forEach((order) => {
      // Only successful orders
      if (!isSuccessfulOrder(order)) {
        return;
      }

      // ----------------------------------------
      // ORDER DATE
      // ----------------------------------------

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

      // ----------------------------------------
      // APPLY FILTER
      // ----------------------------------------

      if (!isInsideFilter(orderDate)) {
        return;
      }

      // ----------------------------------------
      // PARSE ITEMS
      // ----------------------------------------

      let items = order.items;

      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch (err) {
          console.error(
            "Invalid order items JSON:",
            err
          );

          return;
        }
      }

      if (!items) {
        return;
      }

      const itemList = Array.isArray(items)
        ? items
        : Object.values(items);

      // ----------------------------------------
      // COUNT PRODUCT QUANTITY
      // ----------------------------------------

      itemList.forEach((item) => {
        const productName =
          item.title ||
          item.product_name ||
          "Unknown Product";

        const quantity = Number(
          item.quantity || 0
        );

        if (!productMap[productName]) {
          productMap[productName] = 0;
        }

        productMap[productName] += quantity;
      });
    });

    return Object.entries(productMap)
      .map(([product, units]) => ({
        product,
        units,
      }))
      .sort(
        (a, b) =>
          b.units - a.units
      );
  }, [orders, filter]);

  // ==========================================
  // TOTAL UNITS
  // ==========================================

  const totalUnits = chartData.reduce(
    (total, item) =>
      total + item.units,
    0
  );

  // ==========================================
  // BEST SELLING PRODUCT
  // ==========================================

  const bestSellingProduct =
    chartData.length > 0
      ? chartData[0]
      : null;

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
        <div className="flex h-[430px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#255DD0]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading product sales...
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
        <div className="flex h-[430px] items-center justify-center">
          <div className="text-center">
            <p className="font-medium text-red-500">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-3 rounded-lg bg-[#255DD0] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 mt-10">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Product Sales
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Track how many units each product has sold
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
            Week
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
            Month
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
            Year
          </button>

        </div>

      </div>

      {/* =====================================
          SUMMARY
      ====================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Total Units */}

        <div className="rounded-xl bg-gray-50 p-5">

          <p className="text-sm font-medium text-gray-500">
            Units Sold
          </p>

          <div className="mt-1 flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {totalUnits.toLocaleString()}
            </p>

            <span className="mb-1 text-sm text-gray-500">
              units
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-400">
            {periodText[filter]}
          </p>

        </div>

        {/* Best Seller */}

        <div className="rounded-xl bg-blue-50 p-5">

          <p className="text-sm font-medium text-[#255DD0]">
            Best Selling Product
          </p>

          {bestSellingProduct ? (
            <>
              <p
                className="mt-1 truncate text-lg font-bold text-gray-900"
                title={bestSellingProduct.product}
              >
                {bestSellingProduct.product}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {bestSellingProduct.units.toLocaleString()}{" "}
                units sold
              </p>
            </>
          ) : (
            <p className="mt-1 text-lg font-bold text-gray-400">
              No sales
            </p>
          )}

        </div>

      </div>

      {/* =====================================
          CHART
      ====================================== */}

      <div className="mt-7 h-[430px] w-full">

        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
              </div>

              <p className="mt-4 font-semibold text-gray-700">
                No product sales found
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

            <LineChart
              data={chartData}
              margin={{
                top: 15,
                right: 20,
                left: 5,
                bottom: 70,
              }}
            >

              {/* Grid */}

              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#eef0f3"
              />

              {/* X AXIS */}

              <XAxis
                dataKey="product"
                tick={{
                  fontSize: 11,
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

              {/* Y AXIS */}

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#6b7280",
                }}
                tickFormatter={(value) =>
                  value.toLocaleString()
                }
                tickLine={false}
                axisLine={false}
                width={55}
              />

              {/* TOOLTIP */}

              <Tooltip
                cursor={{
                  stroke: "#255DD0",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                formatter={(value) => [
                  `${Number(
                    value
                  ).toLocaleString()} units`,
                  "Units Sold",
                ]}
                labelFormatter={(label) =>
                  `Product: ${label}`
                }
                contentStyle={{
                  borderRadius: "14px",
                  border:
                    "1px solid #e5e7eb",
                  backgroundColor:
                    "#ffffff",
                  padding:
                    "12px 14px",
                  boxShadow:
                    "0 12px 30px rgba(0,0,0,0.10)",
                }}
                labelStyle={{
                  color: "#111827",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              />

              {/* LINE */}

              <Line
                type="monotone"
                dataKey="units"
                stroke="#255DD0"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#255DD0",
                  strokeWidth: 3,
                }}
                activeDot={{
                  r: 7,
                  fill: "#255DD0",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
                animationDuration={700}
                animationEasing="ease-out"
              />

            </LineChart>

          </ResponsiveContainer>
        )}

      </div>

    </div>
  );
};

export default Product_bar;