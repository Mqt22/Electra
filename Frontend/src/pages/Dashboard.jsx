import Box from "../components/Box";
import React from "react";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <h1 className="text-2xl font-bold text-gray-900">
        Dashboard
      </h1>

      {/* Dashboard Cards */}
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">

        <Box
          subHeading="Product1"
          Heading="Total Product"
          price="2000PKR"
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

        <Box
          subHeading="Product1"
          Heading="Total Product"
          price="2000PKR"
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

        <Box
          subHeading="Product1"
          Heading="Total Product"
          price="2000PKR"
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

        <Box
          subHeading="Product1"
          Heading="Total Product"
          price="2000PKR"
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

      </div>

    </div>
  );
};

export default Dashboard;