import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  UserCircle,
  Search,
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
  // SEARCH
  // =====================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

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
  // FETCH PRODUCTS FOR SEARCH
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/products"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Search products fetch error:",
          error
        );
      }
    };

    fetchProducts();
  }, []);

  // =====================================================
  // LIVE SEARCH
  // =====================================================

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const filteredProducts = products.filter((product) => {
      const title = String(
        product.title || ""
      ).toLowerCase();

      const category = String(
        product.category || ""
      ).toLowerCase();

      const brand = String(
        product.brand || ""
      ).toLowerCase();

      const description = String(
        product.description || ""
      ).toLowerCase();

      return (
        title.includes(query) ||
        category.includes(query) ||
        brand.includes(query) ||
        description.includes(query)
      );
    });

    // Show maximum 6 results
    setSearchResults(
      filteredProducts.slice(0, 6)
    );

    setSearchOpen(true);
  }, [searchQuery, products]);

  // =====================================================
  // SEARCH RESULT CLICK
  // =====================================================

  const handleSearchResultClick = (product) => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);

    navigate(
      `/shop?highlight=${product.id}`
    );
  };

  // =====================================================
  // SEARCH SUBMIT
  // =====================================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    // Find the best matching product
    const matchedProduct = products.find((product) => {
      const title = String(product.title || "").toLowerCase();
      const category = String(product.category || "").toLowerCase();
      const brand = String(product.brand || "").toLowerCase();

      return (
        title === query ||
        title.includes(query) ||
        brand === query ||
        category === query
      );
    });

    setSearchOpen(false);
    setSearchQuery("");

    if (matchedProduct) {
      navigate(
        `/shop?search=${encodeURIComponent(query)}&highlight=${matchedProduct.id}`
      );
    } else {
      navigate(
        `/shop?search=${encodeURIComponent(query)}`
      );
    }
  };

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

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">

          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}

          <div className="flex shrink-0 items-center gap-4">

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

          {/* ================================================= */}
          {/* DESKTOP NAVIGATION */}
          {/* ================================================= */}

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

                      if (
                        item.link ===
                        "Categories"
                      ) {
                        e.preventDefault();

                        setCategoriesOpen(
                          (prev) => !prev
                        );
                      }

                    }}
                    className={`font-medium transition ${item.link ===
                      "Categories"
                      ? categoriesOpen
                        ? "text-[#255DD0]"
                        : "text-gray-700 hover:text-[#255DD0]"
                      : isActive(
                        item.path
                      )
                        ? "text-[#255DD0]"
                        : "text-gray-700 hover:text-[#255DD0]"
                      }`}
                  >
                    {item.link}
                  </Link>

                  {item.link ===
                    "Categories" &&
                    categoriesOpen && (
                      <CategoriesDropdown
                        onClose={() =>
                          setCategoriesOpen(
                            false
                          )
                        }
                      />
                    )}

                </li>

              ))}

            </ul>

          </nav>

          {/* ================================================= */}
          {/* SEARCH BAR */}
          {/* ================================================= */}

          <div className="relative hidden min-w-0 flex-1 lg:block lg:max-w-md">

            <form
              onSubmit={
                handleSearchSubmit
              }
              className="relative"
            >

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )}
                onFocus={() => {
                  if (
                    searchQuery.trim()
                  ) {
                    setSearchOpen(
                      true
                    );
                  }
                }}
                placeholder="Search products..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
              />

            </form>

            {/* ================================================= */}
            {/* SEARCH RESULTS */}
            {/* ================================================= */}

            {searchOpen &&
              searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                  {searchResults.length >
                    0 ? (

                    <div className="py-2">

                      {searchResults.map(
                        (product) => (

                          <button
                            key={product.id}
                            type="button"
                            onClick={() =>
                              handleSearchResultClick(
                                product
                              )
                            }
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50"
                          >

                            {/* Product Image */}

                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                              {product.image_url ? (

                                <img
                                  src={
                                    product.image_url
                                  }
                                  alt={
                                    product.title
                                  }
                                  className="h-full w-full object-cover"
                                />

                              ) : (

                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                  No Image
                                </div>

                              )}

                            </div>

                            {/* Product Information */}

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-semibold text-gray-900">
                                {product.title}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-500">
                                {product.category}
                              </p>

                            </div>

                            {/* Price */}

                            <span className="shrink-0 text-sm font-semibold text-[#255DD0]">
                              {Number(
                                product.price ||
                                0
                              ).toLocaleString()}{" "}
                              PKR
                            </span>

                          </button>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="px-4 py-6 text-center">

                      <Search
                        size={24}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-2 text-sm font-medium text-gray-700">
                        No products found
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Try another search term.
                      </p>

                    </div>

                  )}

                </div>
              )}

          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="flex shrink-0 items-center gap-3">

            {/* LOGIN / SIGNUP */}

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

            {/* PROFILE */}

            <div className="relative">

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

                {admin ? (

                  admin.picture ? (

                    <img
                      src={admin.picture}
                      alt={
                        admin.name ||
                        "Admin"
                      }
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <UserCircle
                      size={28}
                      className="text-gray-500"
                    />

                  )

                ) : user?.picture ? (

                  <img
                    src={user.picture}
                    alt={
                      user.name ||
                      "Profile"
                    }
                    className="h-full w-full object-cover"
                  />

                ) : (

                  <UserCircle
                    size={28}
                    className="text-gray-500"
                  />

                )}

              </button>

              {/* ADMIN DROPDOWN */}

              {admin &&
                profileOpen && (

                  <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">

                    <p className="font-semibold text-gray-900">
                      {admin.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(
                          false
                        );

                        navigate(
                          "/admin/settings/profile"
                        );
                      }}
                      className="mt-3 block w-full text-left text-sm font-medium text-[#255DD0] hover:underline"
                    >
                      Profile Settings
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleAdminLogout
                      }
                      className="mt-3 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>

                  </div>
                )}

              {/* CUSTOMER DROPDOWN */}

              {!admin &&
                user &&
                profileOpen && (

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
                        setProfileOpen(
                          false
                        );

                        navigate(
                          "/profile"
                        );
                      }}
                      className="mt-3 block w-full text-left text-sm font-medium text-[#255DD0] hover:underline"
                    >
                      Profile Settings
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="mt-3 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>

                  </div>
                )}

            </div>

            {/* ADMIN BUTTON */}

            {admin && (
              <Link
                to="/admin/dashboard"
                className="hidden rounded-lg bg-[#255DD0] px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:block"
              >
                Admin
              </Link>
            )}

            {/* CART */}

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

      {/* ===================================================== */}
      {/* MOBILE SIDEBAR */}
      {/* ===================================================== */}

      <aside
        className={`fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-full max-w-xs bg-white shadow-xl transition-transform duration-300 sm:top-20 sm:h-[calc(100vh-5rem)] sm:w-72 sm:max-w-none ${isOpen
          ? "translate-x-0"
          : "translate-x-full"
          }`}
      >

        <nav className="flex h-full flex-col p-4 sm:p-6">

          {/* MOBILE SEARCH */}

          <div className="relative mb-5">

            <form
              onSubmit={
                handleSearchSubmit
              }
            >

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )}
                placeholder="Search products..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
              />

            </form>

            {searchOpen &&
              searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">

                  {searchResults.length >
                    0 ? (

                    searchResults.map(
                      (product) => (

                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            handleSearchResultClick(
                              product
                            );

                            setIsOpen(
                              false
                            );
                          }}
                          className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-blue-50"
                        >

                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                            {product.image_url ? (

                              <img
                                src={
                                  product.image_url
                                }
                                alt={
                                  product.title
                                }
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                No Image
                              </div>

                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {product.title}
                            </p>

                            <p className="text-xs text-gray-500">
                              {Number(
                                product.price ||
                                0
                              ).toLocaleString()}{" "}
                              PKR
                            </p>

                          </div>

                        </button>

                      )
                    )

                  ) : (

                    <p className="px-4 py-5 text-center text-sm text-gray-500">
                      No products found.
                    </p>

                  )}

                </div>
              )}

          </div>

          {/* MOBILE LINKS */}

          <ul className="flex flex-col">

            {mobileLinks.map(
              (navItem, index) => (

                <li key={index}>

                  <Link
                    to={
                      navItem.path || "#"
                    }
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
                      isActive(
                        navItem.path
                      )
                      ? "bg-blue-50 text-[#255DD0]"
                      : "text-gray-700 hover:bg-blue-50 hover:text-[#255DD0]"
                      }`}
                  >
                    {navItem.link}
                  </Link>

                </li>

              )
            )}

          </ul>

          {/* MOBILE LOGIN / SIGNUP */}

          {!user && !admin && (
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 sm:hidden">

              <Link
                to="/login"
                onClick={() =>
                  setIsOpen(false)
                }
                className="rounded-lg border border-[#255DD0] px-4 py-2 text-center text-sm font-semibold text-[#255DD0]"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() =>
                  setIsOpen(false)
                }
                className="rounded-lg bg-[#255DD0] px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Sign Up
              </Link>

            </div>
          )}

        </nav>

      </aside>

      {/* ===================================================== */}
      {/* OVERLAY */}
      {/* ===================================================== */}

      {isOpen && (
        <div
          onClick={() =>
            setIsOpen(false)
          }
          className="fixed inset-0 top-16 z-30 bg-black/30 sm:top-20"
        />
      )}

    </>
  );
};

export default Header;