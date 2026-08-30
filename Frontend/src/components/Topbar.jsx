import React from "react";
import {
  Menu,
  Search,
  Bell,
  User,
  X,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { BiCategory } from "react-icons/bi";

const Topbar = ({
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const [admin, setAdmin] = React.useState(null);

  // Backend data
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [orders, setOrders] = React.useState([]);

  // Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearchResults, setShowSearchResults] =
    React.useState(false);

  const searchRef = React.useRef(null);

  const navigate = useNavigate();

  /*
   * ============================
   * LOAD ADMIN
   * ============================
   */

  const loadAdmin = React.useCallback(async () => {
    try {
      const storedAdmin =
        localStorage.getItem("electra_admin");

      if (!storedAdmin) {
        setAdmin(null);
        return;
      }

      const parsedAdmin = JSON.parse(storedAdmin);

      const adminId =
        parsedAdmin?.user_id ?? parsedAdmin?.id;

      if (!adminId) {
        console.error("Admin ID not found");
        setAdmin(parsedAdmin);
        return;
      }

      const response = await fetch(
        `http://localhost:8000/admin/profile/${adminId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch admin profile: ${response.status}`
        );
      }

      const latestAdmin = await response.json();

      const updatedAdmin = {
        ...parsedAdmin,
        ...latestAdmin,
        user_id:
          latestAdmin?.user_id ??
          latestAdmin?.id ??
          parsedAdmin?.user_id ??
          parsedAdmin?.id,
      };

      setAdmin(updatedAdmin);

      localStorage.setItem(
        "electra_admin",
        JSON.stringify(updatedAdmin)
      );
    } catch (error) {
      console.error(
        "Failed to load admin profile:",
        error
      );

      try {
        const storedAdmin =
          localStorage.getItem("electra_admin");

        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (storageError) {
        console.error(
          "Failed to read stored admin:",
          storageError
        );
      }
    }
  }, []);

  /*
   * ============================
   * LOAD SEARCH DATA
   * ============================
   */

  const loadSearchData = React.useCallback(async () => {
    try {
      const [
        productsResponse,
        categoriesResponse,
        ordersResponse,
      ] = await Promise.all([
        fetch("http://localhost:8000/products"),
        fetch("http://localhost:8000/categories"),
        fetch("http://localhost:8000/orders"),
      ]);

      /*
       * PRODUCTS
       */
      if (productsResponse.ok) {
        const productsData =
          await productsResponse.json();

        /*
         * Handles both:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * and:
         *
         * {
         *   products: [...]
         * }
         */
        setProducts(
          Array.isArray(productsData)
            ? productsData
            : productsData?.products || []
        );
      }

      /*
       * CATEGORIES
       */
      if (categoriesResponse.ok) {
        const categoriesData =
          await categoriesResponse.json();

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData?.categories || []
        );
      }

      /*
       * ORDERS
       */
      if (ordersResponse.ok) {
        const ordersData =
          await ordersResponse.json();

        setOrders(
          Array.isArray(ordersData)
            ? ordersData
            : ordersData?.orders || []
        );
      }
    } catch (error) {
      console.error(
        "Failed to load search data:",
        error
      );
    }
  }, []);

  /*
   * ============================
   * INITIAL LOAD
   * ============================
   */

  React.useEffect(() => {
    loadAdmin();
    loadSearchData();

    window.addEventListener(
      "adminProfileUpdated",
      loadAdmin
    );

    window.addEventListener(
      "storage",
      loadAdmin
    );

    return () => {
      window.removeEventListener(
        "adminProfileUpdated",
        loadAdmin
      );

      window.removeEventListener(
        "storage",
        loadAdmin
      );
    };
  }, [loadAdmin, loadSearchData]);

  /*
   * ============================
   * CLOSE SEARCH WHEN CLICKING
   * OUTSIDE
   * ============================
   */

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ============================
   * SIDEBAR
   * ============================
   */

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  /*
   * ============================
   * SEARCH RESULTS
   * ============================
   */

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();

    const results = [];

    // ============================
    // PRODUCTS
    // ============================

    products.forEach((product) => {
      const title =
        product.Product_title ??
        product.product_title ??
        product.title ??
        "";

      const category =
        product.Category ??
        product.category ??
        "";

      const description =
        product.Product_des ??
        product.product_des ??
        product.description ??
        "";

      const productId =
        product.Product_ID ??
        product.product_id ??
        product.id;

      if (
        title.toString().toLowerCase().includes(query) ||
        category.toString().toLowerCase().includes(query) ||
        description.toString().toLowerCase().includes(query)
      ) {
        results.push({
          id: `product-${productId}`,
          type: "Product",
          title: title || `Product #${productId}`,
          description: category
            ? `Product • ${category}`
            : "Product",
          icon: Package,

          // Highlight the selected product
          path: `/admin/products?highlight=${productId}`,
        });
      }
    });


    // ============================
    // CATEGORIES
    // ============================

    categories.forEach((category) => {
      const categoryName =
        category.name ??
        category.Category ??
        category.category ??
        "";

      const categoryId =
        category.id ??
        category.Category_ID ??
        category.category_id;

      if (
        categoryName
          .toString()
          .toLowerCase()
          .includes(query)
      ) {
        results.push({
          id: `category-${categoryId}`,
          type: "Category",
          title: categoryName,
          description: "Product Category",
          icon: BiCategory,

          // Highlight the selected category
          path: `/admin/categories?highlight=${categoryId}`,
        });
      }
    });


    // ============================
    // ORDERS
    // ============================

    orders.forEach((order) => {
      const orderId =
        order.order_id ??
        order.Order_ID ??
        order.id;

      const customerName =
        order.customer_name ??
        order.Customer_Name ??
        order.customer ??
        order.name ??
        "";

      const status =
        order.status ??
        order.Status ??
        "";

      const searchableText = `
    ${orderId ?? ""}
    ${customerName}
    ${status}
  `.toLowerCase();

      if (searchableText.includes(query)) {
        results.push({
          id: `order-${orderId}`,
          type: "Order",
          title: `Order #${orderId}`,
          description: customerName
            ? `${customerName}${status ? ` • ${status}` : ""}`
            : status || "Customer Order",
          icon: ShoppingCart,

          // Highlight the selected order
          path: `/admin/orders?highlight=${orderId}`,
        });
      }
    });

    return results.slice(0, 10);
  }, [
    searchQuery,
    products,
    categories,
    orders,
  ]);

  /*
   * ============================
   * RESULT CLICK
   * ============================
   */

  const handleSearchResultClick = (result) => {
    setSearchQuery("");
    setShowSearchResults(false);

    navigate(result.path);
  };

  /*
   * ============================
   * CLEAR SEARCH
   * ============================
   */

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <header
      className={`
        fixed
        top-0
        right-0
        left-0
        z-40
        h-16
        bg-white
        border-b
        border-gray-200
        transition-all
        duration-300
        ease-in-out
        ${sidebarCollapsed
          ? "lg:left-20"
          : "lg:left-64"
        }
      `}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* ========================= */}
        {/* LEFT SECTION */}
        {/* ========================= */}

        <div className="flex items-center gap-3">

          {/* Hamburger */}
          <button
            onClick={handleMenuClick}
            className="
              p-2
              rounded-lg
              text-gray-600
              hover:bg-blue-50
              hover:text-[#2563eb]
              transition
            "
            title={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            <Menu size={24} />
          </button>

          {/* ========================= */}
          {/* SEARCH */}
          {/* ========================= */}

          <div
            ref={searchRef}
            className="
              relative
              hidden
              sm:block
              w-48
              md:w-64
              lg:w-72
              xl:w-96
            "
          >
            <Search
              size={19}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                pointer-events-none
              "
            />

            <input
              type="text"
              value={searchQuery}
              placeholder="Search products, orders..."
              onChange={(e) => {
                const value = e.target.value;

                setSearchQuery(value);

                setShowSearchResults(
                  value.trim().length > 0
                );
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setShowSearchResults(true);
                }
              }}
              className="
                w-full
                h-10
                pl-10
                pr-10
                rounded-lg
                border
                border-gray-400
                bg-gray-50
                text-sm
                text-gray-700
                outline-none
                transition
                focus:border-[#2563eb]
                focus:ring-2
                focus:ring-blue-100
                focus:bg-white
              "
            />

            {/* Clear */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-700
                "
              >
                <X size={17} />
              </button>
            )}

            {/* ========================= */}
            {/* LIVE RESULTS */}
            {/* ========================= */}

            {showSearchResults && (
              <div
                className="
                  absolute
                  top-12
                  left-0
                  right-0
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  shadow-xl
                  overflow-hidden
                  z-50
                "
              >

                {searchResults.length > 0 ? (
                  <div className="py-2">

                    <div className="
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-gray-400
                      uppercase
                      tracking-wide
                    ">
                      Search Results
                    </div>

                    {searchResults.map((result) => {
                      const Icon = result.icon;

                      return (
                        <button
                          key={result.id}
                          onClick={() =>
                            handleSearchResultClick(
                              result
                            )
                          }
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            text-left
                            hover:bg-blue-50
                            transition
                          "
                        >

                          {/* Icon */}
                          <div
                            className="
                              w-9
                              h-9
                              rounded-lg
                              bg-blue-50
                              text-[#2563eb]
                              flex
                              items-center
                              justify-center
                              shrink-0
                            "
                          >
                            <Icon size={18} />
                          </div>

                          {/* Result Information */}
                          <div className="min-w-0 flex-1">

                            <div className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            ">
                              <p className="
                                text-sm
                                font-semibold
                                text-gray-800
                                truncate
                              ">
                                {result.title}
                              </p>

                              <span className="
                                text-[10px]
                                font-medium
                                text-gray-400
                                shrink-0
                              ">
                                {result.type}
                              </span>
                            </div>

                            <p className="
                              text-xs
                              text-gray-400
                              truncate
                              mt-0.5
                            ">
                              {result.description}
                            </p>

                          </div>

                        </button>
                      );
                    })}

                  </div>
                ) : (
                  <div className="
                    px-4
                    py-7
                    text-center
                  ">
                    <Search
                      size={22}
                      className="
                        mx-auto
                        mb-2
                        text-gray-300
                      "
                    />

                    <p className="
                      text-sm
                      font-medium
                      text-gray-600
                    ">
                      No results found
                    </p>

                    <p className="
                      text-xs
                      text-gray-400
                      mt-1
                    ">
                      Try another search
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* RIGHT SECTION */}
        {/* ========================= */}

        <div className="flex items-center gap-2 sm:gap-4">

          {/* Mobile Search */}
          <button
            className="
              sm:hidden
              p-2
              rounded-lg
              text-gray-600
              hover:bg-blue-50
              hover:text-[#2563eb]
              transition
            "
          >
            <Search size={21} />
          </button>

          {/* Go Back */}
          <button
            className="
              hidden
              rounded-lg
              bg-[#255DD0]
              px-3
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              sm:block
            "
          >
            <Link to="/">
              Go Back
            </Link>
          </button>

          {/* Notifications */}
          <button
            className="
              relative
              p-2
              rounded-lg
              text-gray-600
              hover:bg-blue-50
              hover:text-[#2563eb]
              transition
            "
          >
            <Bell size={21} />

            <span
              className="
                absolute
                top-1
                right-1
                w-2
                h-2
                rounded-full
                bg-[#2563eb]
                border-2
                border-white
              "
            ></span>
          </button>

          {/* Divider */}
          <div className="
            hidden
            sm:block
            h-8
            w-px
            bg-gray-200
          "></div>

          {/* Profile */}
          <button
            className="
              flex
              items-center
              gap-2
              p-1.5
              sm:px-2
              sm:py-1.5
              rounded-lg
              hover:bg-gray-50
              transition
            "
          >

            {/* Profile Picture */}
            <div
              className="
                w-9
                h-9
                rounded-full
                border
                border-gray-200
                bg-gray-100
                flex
                items-center
                justify-center
                overflow-hidden
              "
            >
              {admin?.picture ? (
                <img
                  src={admin.picture}
                  alt={admin.name || "Admin"}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                <User
                  size={19}
                  className="text-gray-400"
                />
              )}
            </div>

            {/* Profile Name */}
            <div className="
              hidden
              md:block
              text-left
            ">
              <p className="
                text-sm
                font-medium
                text-gray-800
              ">
                {admin?.name || "Admin"}
              </p>

              <p className="
                text-xs
                text-gray-400
              ">
                Administrator
              </p>
            </div>

          </button>

        </div>
      </div>
    </header>
  );
};

export default Topbar;