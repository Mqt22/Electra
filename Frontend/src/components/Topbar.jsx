import React from "react";
import { Menu, Search, Bell, User} from "lucide-react";
import Home from "../pages/Home.jsx"
import { Link } from "react-router-dom";

const Topbar = ({
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const [admin, setAdmin] = React.useState(null);

  React.useEffect(() => {
    const loadAdmin = () => {
      const storedAdmin = localStorage.getItem("electra_admin");

      if (storedAdmin) {
        try {
          setAdmin(JSON.parse(storedAdmin));
        } catch (error) {
          console.error("Invalid admin data:", error);
        }
      }
    };

    // Load initially
    loadAdmin();

    // Listen for admin profile changes
    window.addEventListener(
      "adminProfileUpdated",
      loadAdmin
    );

    return () => {
      window.removeEventListener(
        "adminProfileUpdated",
        loadAdmin
      );
    };
  }, []);

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      // Desktop: collapse / expand sidebar
      setSidebarCollapsed((prev) => !prev);
    } else {
      // Mobile: open / close sidebar
      setSidebarOpen((prev) => !prev);
    }
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

        {/* Left Section */}
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

          {/* Search */}
          <div className="relative hidden sm:block w-48 md:w-64 lg:w-72 xl:w-96">
            <Search
              size={19}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search..."
              className="
                w-full
                h-10
                pl-10
                pr-4
                rounded-lg
                border border-gray-400
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
          </div>
        </div>

        {/* Right Section */}
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
            hover:cursor-pointer
          ">
            <Link to="/">Go Back</Link>
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

            {/* Notification Badge */}
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
          <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

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
                  className="h-full w-full object-cover"
                />
              ) : (
                <User
                  size={19}
                  className="text-gray-400"
                />
              )}
            </div>

            {/* Profile Name */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">
                {admin?.name || "Admin"}
              </p>

              <p className="text-xs text-gray-400">
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