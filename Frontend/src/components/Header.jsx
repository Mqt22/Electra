import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  UserCircle,
} from "lucide-react";

import CategoriesDropdown from "../components/CatagoriesDropdwon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/Cartcontext.jsx";

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // =====================================================
  // PROFILE DROPDOWN
  // =====================================================

  const [profileOpen, setProfileOpen] = useState(false);

  // =====================================================
  // ADMIN SESSION
  // =====================================================

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const loadAdmin = () => {
      const storedAdmin = localStorage.getItem("electra_admin");

      if (!storedAdmin) {
        setAdmin(null);
        return;
      }

      try {
        const adminData = JSON.parse(storedAdmin);

        if (adminData?.user_id) {
          setAdmin(adminData);
        } else {
          localStorage.removeItem("electra_admin");
          setAdmin(null);
        }
      } catch (error) {
        console.error("Invalid admin session:", error);

        localStorage.removeItem("electra_admin");
        setAdmin(null);
      }
    };

    loadAdmin();

    window.addEventListener(
      "adminAuthChanged",
      loadAdmin
    );

    return () => {
      window.removeEventListener(
        "adminAuthChanged",
        loadAdmin
      );
    };
  }, []);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navLinks = [
    { link: "Home", path: "/" },
    { link: "Categories" },
    { link: "Shop", path: "/shop" },
  ];

  const mobileLinks = [
    { link: "Home", path: "/" },
    { link: "Categories" },
    { link: "Shop", path: "/shop" },
    { link: "About", path: "/about" },
    { link: "Contact", path: "/contact" },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  // =====================================================
  // CUSTOMER LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // =====================================================
  // ADMIN LOGOUT
  // =====================================================

  const handleAdminLogout = () => {
    localStorage.removeItem("electra_admin");

    setAdmin(null);

    window.dispatchEvent(
      new Event("adminAuthChanged")
    );

    navigate("/");
  };

  // =====================================================
  // PROFILE CLICK
  // =====================================================

  const handleProfileClick = () => {
    setProfileOpen((prev) => !prev);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#F7F9FB]">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">

          {/* Left */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-blue-100 sm:h-10 sm:w-10 lg:hidden"
            >
              <Menu
                size={24}
                className={`absolute text-[#255DD0] transition-all duration-300 ${isOpen
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
                  }`}
              />

              <X
                size={24}
                className={`absolute text-[#255DD0] transition-all duration-300 ${isOpen
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
                  }`}
              />
            </button>

            <h1 className="text-xl font-extrabold tracking-wide text-[#255DD0] sm:text-2xl">
              ElECTRA
            </h1>

          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">

            <ul className="flex items-center gap-8">

              {navLinks.map((item, index) => (

                <li
                  key={index}
                  className="relative"
                >

                  <Link
                    to={item.path || "#"}
                    onClick={(e) => {

                      if (item.link === "Categories") {
                        e.preventDefault();

                        setCategoriesOpen(
                          (prev) => !prev
                        );
                      }

                    }}
                    className={`font-medium transition ${item.link === "Categories"
                      ? categoriesOpen
                        ? "text-[#255DD0]"
                        : "text-gray-700 hover:text-[#255DD0]"
                      : isActive(item.path)
                        ? "text-[#255DD0]"
                        : "text-gray-700 hover:text-[#255DD0]"
                      }`}
                  >
                    {item.link}
                  </Link>

                  {item.link === "Categories" &&
                    categoriesOpen && (
                      <CategoriesDropdown
                        onClose={() =>
                          setCategoriesOpen(false)
                        }
                      />
                    )}

                </li>

              ))}

            </ul>

          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* ================================================= */}
            {/* LOGIN / SIGNUP */}
            {/* Only show when NEITHER customer NOR admin exists */}
            {/* ================================================= */}

            {!user && !admin && (
              <div className="hidden items-center gap-3 sm:flex">

                <Link
                  to="/login"
                  className="rounded-lg border border-[#255DD0] px-3 py-2 text-sm font-semibold text-[#255DD0] transition hover:bg-[#255DD0] hover:text-white sm:px-5"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-lg bg-[#255DD0] px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-5"
                >
                  Sign Up
                </Link>

              </div>
            )}

            {/* ================================================= */}
            {/* PROFILE */}
            {/* ================================================= */}

            <div className="relative">

              {/* Profile Icon */}

              <button
                type="button"
                onClick={() => {
                  if (!admin && !user) {
                    navigate("/login");
                    return;
                  }

                  handleProfileClick();
                }}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100"
              >

                {/* ================= ADMIN ================= */}

                {admin ? (

                  admin.picture ? (

                    <img
                      src={admin.picture}
                      alt={admin.name || "Admin"}
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <UserCircle
                      size={28}
                      className="text-gray-500"
                    />

                  )

                ) : user?.picture ? (

                  /* ================= CUSTOMER ================= */

                  <img
                    src={user.picture}
                    alt={user.name || "Profile"}
                    className="h-full w-full object-cover"
                  />

                ) : (

                  <UserCircle
                    size={28}
                    className="text-gray-500"
                  />

                )}

              </button>


              {/* ================================================= */}
              {/* ADMIN DROPDOWN */}
              {/* ================================================= */}

              {admin && profileOpen && (

                <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">

                  <p className="font-semibold text-gray-900">
                    {admin.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin/settings/profile");
                    }}
                    className="mt-3 block w-full text-left text-sm font-medium text-[#255DD0] hover:underline"
                  >
                    Profile Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="mt-3 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>

                </div>

              )}


              {/* ================================================= */}
              {/* CUSTOMER DROPDOWN */}
              {/* ================================================= */}

              {!admin && user && profileOpen && (

                <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">

                  <p className="font-semibold text-gray-900">
                    {user.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {user.email}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="mt-3 block w-full text-left text-sm font-medium text-[#255DD0] hover:underline"
                  >
                    Profile Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>

                </div>

              )}

            </div>


            {/* ================================================= */}
            {/* ADMIN BUTTON */}
            {/* ================================================= */}

            {admin && (
              <Link
                to="/admin/dashboard"
                className="hidden rounded-lg bg-[#255DD0] px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:block"
              >
                Admin
              </Link>
            )}


            {/* Cart */}

            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg hover:bg-blue-100"
            >

              <ShoppingCart
                size={28}
                className="text-[#255DD0]"
              />

              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}

            </Link>

          </div>

        </div>
      </header>


      {/* Mobile Sidebar */}

      <aside
        className={`fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-full max-w-xs bg-white shadow-xl transition-transform duration-300 sm:top-20 sm:w-72 sm:max-w-none sm:h-[calc(100vh-5rem)] ${isOpen
          ? "translate-x-0"
          : "translate-x-full"
          }`}
      >

        <nav className="flex h-full flex-col p-4 sm:p-6">

          <ul className="flex flex-col">

            {mobileLinks.map((navItem, index) => (

              <li key={index}>

                <Link
                  to={navItem.path || "#"}
                  onClick={(e) => {

                    if (
                      navItem.link ===
                      "Categories"
                    ) {
                      e.preventDefault();
                    }

                    setIsOpen(false);

                  }}
                  className={`block rounded-lg px-4 py-2 text-base font-medium transition sm:py-3 sm:text-lg ${navItem.path &&
                    isActive(navItem.path)
                    ? "bg-blue-50 text-[#255DD0]"
                    : "text-gray-700 hover:bg-blue-50 hover:text-[#255DD0]"
                    }`}
                >
                  {navItem.link}
                </Link>

              </li>

            ))}

          </ul>


          {/* Mobile Login / Signup */}

          {!user && !admin && (
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 sm:hidden">

              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-[#255DD0] px-4 py-2 text-center text-sm font-semibold text-[#255DD0]"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-[#255DD0] px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Sign Up
              </Link>

            </div>
          )}

        </nav>

      </aside>


      {/* Overlay */}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-16 z-30 bg-black/30 sm:top-20"
        />
      )}

    </>
  );
};

export default Header;