import React from "react";
import Header from "./components/Header";
import { Routes, Route, useLocation } from "react-router-dom";

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

import AdminLogin from "./pages/Adminlogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import CartProvider from "./context/Cartcontext.jsx";
import AdminProfile from "./components/AdminProfile.jsx";

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