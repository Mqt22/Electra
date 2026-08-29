import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
} from "lucide-react";

import Box from "../components/Box.jsx";

const Customer_Page = () => {
  const [customers, setCustomers] = useState([]);

  const [stats, setStats] = useState({
    total_customers: 0,
    total_orders: 0,
    total_revenue: 0,
    total_items: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  useEffect(() => {
    const fetchCustomers = async () => {
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
        // CREATE CUSTOMERS FROM ORDERS
        // ==========================================

        const customerMap = {};

        let totalRevenue = 0;
        let totalItems = 0;

        orders.forEach((order) => {
          const name = order.customer_name || "Unknown Customer";
          const email = order.customer_email || "No email";

          // Use email as the unique customer identifier
          const customerKey = email.toLowerCase().trim();

          // ==========================================
          // CALCULATE ITEMS
          // ==========================================

          let items = order.items;

          if (typeof items === "string") {
            try {
              items = JSON.parse(items);
            } catch (error) {
              items = {};
            }
          }

          const itemList = Array.isArray(items)
            ? items
            : Object.values(items || {});

          const orderItems = itemList.reduce(
            (sum, item) =>
              sum + Number(item.quantity || 0),
            0
          );

          // ==========================================
          // CUSTOMER
          // ==========================================

          if (!customerMap[customerKey]) {
            customerMap[customerKey] = {
              name,
              email,
              orders: 0,
              total_spent: 0,
              items_bought: 0,
              last_order: order.created_at || null,
            };
          }

          customerMap[customerKey].orders += 1;

          customerMap[customerKey].total_spent += Number(
            order.total_amount || 0
          );

          customerMap[customerKey].items_bought += orderItems;

          // Update latest order
          if (
            order.created_at &&
            (!customerMap[customerKey].last_order ||
              new Date(order.created_at) >
                new Date(customerMap[customerKey].last_order))
          ) {
            customerMap[customerKey].last_order =
              order.created_at;
          }

          // Overall statistics
          totalRevenue += Number(
            order.total_amount || 0
          );

          totalItems += orderItems;
        });

        const customerList = Object.values(customerMap);

        // ==========================================
        // SORT CUSTOMERS
        // ==========================================

        customerList.sort(
          (a, b) =>
            b.total_spent - a.total_spent
        );

        // ==========================================
        // SET STATE
        // ==========================================

        setCustomers(customerList);

        setStats({
          total_customers: customerList.length,
          total_orders: orders.length,
          total_revenue: totalRevenue,
          total_items: totalItems,
        });

      } catch (err) {
        console.error(
          "Fetch customers error:",
          err
        );

        setError(
          "Failed to load customer data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatPKR = (value) => {
    return `PKR ${Number(
      value || 0
    ).toLocaleString()}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
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
            Loading customers...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-10">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your customers and their purchase activity.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">

          <Users
            size={18}
            className="text-[#255DD0]"
          />

          <span className="text-sm font-semibold text-gray-700">
            {customers.length} Customers
          </span>

        </div>

      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ==========================================
          CUSTOMER STATISTICS
      ========================================== */}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">

        {/* TOTAL CUSTOMERS */}

        <Box
          subHeading="Customers"
          Heading="Total Customers"
          price={stats.total_customers}
          icon={{
            icon: Users,
            color: "text-blue-600",
          }}
        />

        {/* TOTAL ORDERS */}

        <Box
          subHeading="Orders"
          Heading="Total Orders"
          price={stats.total_orders}
          icon={{
            icon: ShoppingCart,
            color: "text-blue-600",
          }}
        />

        {/* TOTAL SPENDING */}

        <Box
          subHeading="Revenue"
          Heading="Customer Spending"
          price={formatPKR(stats.total_revenue)}
          icon={{
            icon: DollarSign,
            color: "text-blue-600",
          }}
        />

        {/* ITEMS SOLD */}

        <Box
          subHeading="Products"
          Heading="Items Purchased"
          price={stats.total_items}
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

      </div>

      {/* ==========================================
          CUSTOMER TABLE
      ========================================== */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-[1000px] w-full">

            <thead>

              <tr className="border-b border-gray-200 bg-gray-50">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Orders
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Items Purchased
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Spent
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Last Order
                </th>

              </tr>

            </thead>

            <tbody>

              {customers.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center"
                  >

                    <Users
                      size={40}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-medium text-gray-700">
                      No customers found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Customers will appear here after orders are placed.
                    </p>

                  </td>

                </tr>

              ) : (

                customers.map((customer, index) => (

                  <tr
                    key={`${customer.email}-${index}`}
                    className="border-b border-gray-100 transition hover:bg-gray-50 last:border-b-0"
                  >

                    {/* CUSTOMER */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#255DD0]">
                          {customer.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {customer.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            Customer #{index + 1}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {customer.email}
                    </td>

                    {/* ORDERS */}

                    <td className="px-5 py-4">

                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#255DD0]">
                        {customer.orders}
                      </span>

                    </td>

                    {/* ITEMS */}

                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      {customer.items_bought}
                    </td>

                    {/* TOTAL SPENT */}

                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {formatPKR(
                        customer.total_spent
                      )}
                    </td>

                    {/* LAST ORDER */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(
                        customer.last_order
                      )}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Customer_Page;