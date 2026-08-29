import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
} from "lucide-react";

import Box from "../components/Box.jsx";
import Sales_Chart from "../components/Sales_Chart.jsx";

const Sales_Page = () => {
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0,
    average_order_value: 0,
    items_sold: 0,
  });

  const [salesData, setSalesData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8000/orders"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const orders = await response.json();

        if (!Array.isArray(orders)) {
          throw new Error("Invalid order data");
        }

        // ==========================================
        // TOTAL SALES
        // ALL ORDERS ARE SUCCESSFUL SALES
        // ==========================================

        const totalSales = orders.reduce(
          (total, order) =>
            total + Number(order.total_amount || 0),
          0
        );

        // ==========================================
        // TOTAL ORDERS
        // ==========================================

        const totalOrders = orders.length;

        // ==========================================
        // ITEMS SOLD
        // ==========================================

        const itemsSold = orders.reduce(
          (total, order) => {
            if (!order.items) {
              return total;
            }

            let items = order.items;

            // If items is an object, convert it into an array
            if (
              !Array.isArray(items) &&
              typeof items === "object"
            ) {
              items = Object.values(items);
            }

            if (!Array.isArray(items)) {
              return total;
            }

            return (
              total +
              items.reduce(
                (sum, item) =>
                  sum + Number(item.quantity || 0),
                0
              )
            );
          },
          0
        );

        // ==========================================
        // AVERAGE ORDER VALUE
        // ==========================================

        const averageOrderValue =
          totalOrders > 0
            ? totalSales / totalOrders
            : 0;

        // ==========================================
        // SALES BY DATE
        // ==========================================

        const salesByDate = {};

        orders.forEach((order) => {
          const date = order.created_at
            ? String(order.created_at).split("T")[0]
            : "Unknown";

          if (!salesByDate[date]) {
            salesByDate[date] = 0;
          }

          salesByDate[date] += Number(
            order.total_amount || 0
          );
        });

        const chartData = Object.entries(
          salesByDate
        )
          .sort(([dateA], [dateB]) =>
            dateA.localeCompare(dateB)
          )
          .map(([date, sales]) => ({
            date,
            sales,
          }));

        // ==========================================
        // SET STATS
        // ==========================================

        setStats({
          total_sales: totalSales,
          total_orders: totalOrders,
          average_order_value: averageOrderValue,
          items_sold: itemsSold,
        });

        setSalesData(chartData);

      } catch (error) {
        console.error("Sales error:", error);

        setError(
          "Failed to load sales data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // ==========================================
  // FORMAT PKR
  // ==========================================

  const formatPKR = (value) => {
    return `PKR ${Number(
      value || 0
    ).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-10">

      {/* HEADER */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Sales
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor your store's sales performance and revenue.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* SALES CARDS */}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">

        {/* TOTAL SALES */}

        <Box
          subHeading="Revenue"
          Heading="Total Sales"
          price={
            loading
              ? "..."
              : formatPKR(stats.total_sales)
          }
          icon={{
            icon: DollarSign,
            color: "text-blue-600",
          }}
        />

        {/* TOTAL ORDERS */}

        <Box
          subHeading="Orders"
          Heading="Total Orders"
          price={
            loading
              ? "..."
              : stats.total_orders
          }
          icon={{
            icon: ShoppingCart,
            color: "text-blue-600",
          }}
        />

        {/* AVERAGE ORDER VALUE */}

        <Box
          subHeading="Average"
          Heading="Average Order Value"
          price={
            loading
              ? "..."
              : formatPKR(
                  stats.average_order_value
                )
          }
          icon={{
            icon: TrendingUp,
            color: "text-blue-600",
          }}
        />

        {/* ITEMS SOLD */}

        <Box
          subHeading="Products"
          Heading="Items Sold"
          price={
            loading
              ? "..."
              : stats.items_sold
          }
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

      </div>

      {/* SALES CHART */}

      <div className="mt-6">
        <Sales_Chart
          data={salesData}
          loading={loading}
        />
      </div>

    </div>
  );
};

export default Sales_Page;