import React, { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Layers,
} from "lucide-react";

import Box from "../components/Box.jsx";
import Sales_Chart from "../components/Sales_Chart.jsx";
import Product_bar from "../components/Product_bar.jsx";
import Order_bar from "../components/Order_bar.jsx";

const Analytics_Page = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH ANALYTICS DATA
  // =========================================================

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersResponse, productsResponse, categoriesResponse] =
          await Promise.all([
            fetch("http://localhost:8000/orders"),
            fetch("http://localhost:8000/products"),
            fetch("http://localhost:8000/categories"),
          ]);

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders");
        }

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const ordersData = await ordersResponse.json();
        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setOrders(
          Array.isArray(ordersData)
            ? ordersData
            : []
        );

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );
      } catch (err) {
        console.error(
          "Analytics fetch error:",
          err
        );

        setError(
          "Failed to load analytics data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // =========================================================
  // SUCCESSFUL ORDER
  // =========================================================

  const isSuccessfulOrder = (order) => {
    const status = String(
      order.status || ""
    )
      .toLowerCase()
      .trim();

    return (
      status === "successful" ||
      status === "success" ||
      status === "completed"
    );
  };

  // =========================================================
  // SUCCESSFUL ORDERS
  // =========================================================

  const successfulOrders = useMemo(() => {
    return orders.filter(isSuccessfulOrder);
  }, [orders]);

  // =========================================================
  // TOTAL REVENUE
  // =========================================================

  const totalRevenue = useMemo(() => {
    return successfulOrders.reduce(
      (total, order) =>
        total +
        Number(order.total_amount || 0),
      0
    );
  }, [successfulOrders]);

  // =========================================================
  // TOTAL ITEMS SOLD
  // =========================================================

  const totalItemsSold = useMemo(() => {
    return successfulOrders.reduce(
      (total, order) => {
        let items = order.items;

        if (!items) {
          return total;
        }

        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch (error) {
            console.error(
              "Invalid order items:",
              error
            );

            return total;
          }
        }

        const itemList = Array.isArray(items)
          ? items
          : Object.values(items || {});

        return (
          total +
          itemList.reduce(
            (sum, item) =>
              sum +
              Number(item.quantity || 0),
            0
          )
        );
      },
      0
    );
  }, [successfulOrders]);

  // =========================================================
  // AVERAGE ORDER VALUE
  // =========================================================

  const averageOrderValue = useMemo(() => {
    if (successfulOrders.length === 0) {
      return 0;
    }

    return (
      totalRevenue /
      successfulOrders.length
    );
  }, [
    totalRevenue,
    successfulOrders,
  ]);

  // =========================================================
  // UNIQUE CUSTOMERS
  // =========================================================

  const uniqueCustomers = useMemo(() => {
    const customerMap = new Map();

    successfulOrders.forEach((order) => {
      const email = String(
        order.customer_email || ""
      )
        .trim()
        .toLowerCase();

      const name = String(
        order.customer_name || ""
      ).trim();

      /*
       * Prefer email because it uniquely identifies
       * the customer better than name.
       */

      const key =
        email ||
        name.toLowerCase();

      if (!key) {
        return;
      }

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name:
            name ||
            "Unknown Customer",

          email:
            email ||
            "No email",

          orders: 0,

          spent: 0,
        });
      }

      const customer =
        customerMap.get(key);

      customer.orders += 1;

      customer.spent += Number(
        order.total_amount || 0
      );
    });

    return Array.from(
      customerMap.values()
    );
  }, [successfulOrders]);

  // =========================================================
  // TOP CUSTOMER
  // =========================================================

  const topCustomer = useMemo(() => {
    if (uniqueCustomers.length === 0) {
      return null;
    }

    return [...uniqueCustomers].sort(
      (a, b) =>
        b.spent - a.spent
    )[0];
  }, [uniqueCustomers]);

  // =========================================================
  // TOP PRODUCT
  // =========================================================

  const topProduct = useMemo(() => {
    const productMap = {};

    successfulOrders.forEach((order) => {
      let items = order.items;

      if (!items) {
        return;
      }

      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch {
          return;
        }
      }

      const itemList = Array.isArray(items)
        ? items
        : Object.values(items || {});

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

    const sortedProducts = Object.entries(
      productMap
    )
      .map(
        ([name, quantity]) => ({
          name,
          quantity,
        })
      )
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      );

    return sortedProducts.length > 0
      ? sortedProducts[0]
      : null;
  }, [successfulOrders]);

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatPKR = (value) => {
    return `PKR ${Number(
      value || 0
    ).toLocaleString()}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#255DD0]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading analytics...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="mt-10 p-4 sm:p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor your store performance,
          sales, orders, products and customers.
        </p>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">

        {/* TOTAL PRODUCTS */}

        <Box
          subHeading="Products"
          Heading="Total Products"
          price={products.length}
          icon={{
            icon: Package,
            color: "text-blue-600",
          }}
        />

        {/* TOTAL SALES / ORDERS */}

        <Box
          subHeading="Sales"
          Heading="Total Sales"
          price={successfulOrders.length}
          icon={{
            icon: ShoppingCart,
            color: "text-blue-600",
          }}
        />

        {/* TOTAL REVENUE */}

        <Box
          subHeading="Revenue"
          Heading="Total Revenue"
          price={formatPKR(totalRevenue)}
          icon={{
            icon: DollarSign,
            color: "text-blue-600",
          }}
        />

        <Box
          subHeading="Average"
          Heading="Average Order Value"
          price={formatPKR(
            averageOrderValue
          )}
          icon={{
            icon: TrendingUp,
            color: "text-blue-600",
          }}
        />

      </div>

      {/* =====================================================
          SALES OVERVIEW
      ===================================================== */}

      <div className="mt-6">

        <Sales_Chart />

      </div>

      {/* =====================================================
          REVENUE BY PRODUCT
      ===================================================== */}

      <div className="mt-6">

        <Order_bar />

      </div>

      {/* =====================================================
          PRODUCT SALES
      ===================================================== */}

      <div className="mt-6">

        <Product_bar />

      </div>

    </div>
  );
};

export default Analytics_Page;