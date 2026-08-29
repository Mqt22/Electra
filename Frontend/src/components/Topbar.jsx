import React from "react";
import {
  Menu,
  Search,
  Bell,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

const Topbar = ({
                  setSidebarOpen,
                  sidebarCollapsed,
                  setSidebarCollapsed,
                }) => {
  const [admin, setAdmin] = React.useState(null);

  const loadAdmin = React.useCallback(async () => {
    try {
      const storedAdmin = localStorage.getItem("electra_admin");

      if (!storedAdmin) {
        setAdmin(null);
        return;
      }

      const parsedAdmin = JSON.parse(storedAdmin);

      // Get admin ID from either possible field
      const adminId =
          parsedAdmin?.user_id ?? parsedAdmin?.id;

      if (!adminId) {
        console.error("Admin ID not found");
        setAdmin(parsedAdmin);
        return;
      }

      // Fetch the latest admin profile from backend
      const response = await fetch(
          `http://localhost:8000/admin/profile/${adminId}`
      );

      if (!response.ok) {
        throw new Error(
            `Failed to fetch admin profile: ${response.status}`
        );
      }

      const latestAdmin = await response.json();

      console.log("Latest admin profile:", latestAdmin);

      // Keep ID consistent
      const updatedAdmin = {
        ...parsedAdmin,
        ...latestAdmin,
        user_id:
            latestAdmin?.user_id ??
            latestAdmin?.id ??
            parsedAdmin?.user_id ??
            parsedAdmin?.id,
      };

      // Update state
      setAdmin(updatedAdmin);

      // Keep localStorage synchronized
      localStorage.setItem(
          "electra_admin",
          JSON.stringify(updatedAdmin)
      );
    } catch (error) {
      console.error(
          "Failed to load admin profile:",
          error
      );

      // If backend request fails, still use stored data
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

  React.useEffect(() => {
    // Load latest admin profile when Topbar mounts
    loadAdmin();

    // Listen for profile updates from Settings/Profile
    window.addEventListener(
        "adminProfileUpdated",
        loadAdmin
    );

    // Also listen for localStorage changes
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
  }, [loadAdmin]);

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
        ${
              sidebarCollapsed
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