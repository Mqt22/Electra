import Box from "../components/Box.jsx";
import React, { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import OrderChart from "../components/Order_bar.jsx";
import ProductBar from "../components/Product_bar.jsx";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_categories: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/admin/dashboard/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }

        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <h1 className="text-2xl font-bold text-gray-900">
        Dashboard
      </h1>

      {/* Dashboard Cards */}
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">

        {/* Categories */}
        <Box
          subHeading="Category"
          Heading="Total Categories"
          price={
            loading
              ? "..."
              : stats.total_categories
          }
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

        {/* Products */}
        <Box
          subHeading="Product"
          Heading="Total Products"
          price={
            loading
              ? "..."
              : stats.total_products
          }
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

        {/* Orders */}
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

        {/* Revenue */}
        <Box
          subHeading="Revenue"
          Heading="Total Revenue"
          price={
            loading
              ? "..."
              : `PKR ${Number(stats.total_revenue).toFixed(2)}`
          }
          icon={{
            icon: DollarSign,
            color: "text-blue-600",
          }}
        />

      </div>
      {/* Order Chart */}
      <div className="mt-6">
        <OrderChart />
        <ProductBar/>
      </div>
    </div>
  );
};

export default Dashboard;