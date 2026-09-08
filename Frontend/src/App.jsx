import React from "react";
import Header from "./components/Header";
import { Routes, Route, useLocation, Router } from "react-router-dom";

import Home from "./pages/Home";
import Footer from "./components/Footer";
import Product from "./pages/Product.jsx";
import Shop from "./pages/Shop.jsx";
import Cart from "./pages/Cart.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./components/Profile.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import About from "../src/pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Comming from "./pages/Comming.jsx";

import AdminLogin from "./pages/Adminlogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import CartProvider from "./context/Cartcontext.jsx";
import AdminProfile from "./components/AdminProfile.jsx";
import Order from "./pages/Order.jsx";
import Products_page from "./pages/Product_page.jsx";
import Category from "./pages/Category_Page.jsx";
import Sales_Page from "./pages/Sales_Page.jsx";
import Customers from "./pages/Customer_Page.jsx";
import Analytics_Page from "./pages/Analytics_page.jsx";

const App = () => {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <CartProvider>

      {!isAuthPage && !isAdminPage && <Header />}

      <Routes>

        {/* CUSTOMER ROUTES */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/comming"
          element={<Comming />}
        />

        <Route
          path="/products/:id"
          element={<Product />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/shop/:category"
          element={<Shop />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />



        {/* ========================================= */}
        {/* ADMIN LOGIN */}
        {/* ========================================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* ========================================= */}
        {/* PROTECTED ADMIN PANEL */}
        {/* ========================================= */}

        <Route element={<AdminRoute />}>

          <Route element={<AdminLayout />}>

            <Route
              path="/admin/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/admin/products"
              element={<Products_page />}
            />

            <Route
              path="/admin/categories"
              element={<Category />}
            />

            <Route
              path="/admin/orders"
              element={<Order />}
            />

            <Route
              path="/admin/sales"
              element={<Sales_Page />}
            />

            <Route
              path="/admin/customers"
              element={<Customers />}
            />

            <Route
              path="/admin/analytics"
              element={<Analytics_Page />}
            />

            <Route
              path="/admin/settings/profile"
              element={<AdminProfile />}
            />


          </Route>

        </Route>


        {/* ========================================= */}
        {/* 404 */}
        {/* ========================================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

      {!isAuthPage && !isAdminPage && <Footer />}

      {!isAuthPage && !isAdminPage && <ChatWindow />}

    </CartProvider>
  );
};

export default App;