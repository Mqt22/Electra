import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Tags,
    ShoppingCart,
    Settings,
    User,
    LogOut,
    BarChart3,
    Bell,
    X,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
}) => {
    const navigate = useNavigate();

    const [productsOpen, setProductsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const TabLinks = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Products",
            icon: Package,
            submenu: [
                {
                    name: "Products List",
                    path: "/admin/products",
                    icon: Package,
                },
                {
                    name: "Category",
                    path: "/admin/categories",
                    icon: Tags,
                },
            ],
        },
        {
            name: "Sales",
            path: "/admin/sales",
            icon: ShoppingCart,
        },
        {
            name: "Customers",
            path: "/admin/customers",
            icon: User,
        },
        {
            name: "Analytics",
            path: "/admin/analytics",
            icon: BarChart3,
        },
        {
            name: "Notifications",
            path: "/admin/notifications",
            icon: Bell,
        },
    ];

    const navLinkClasses = ({ isActive }) =>
        `flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-300 ${
            sidebarCollapsed
                ? "justify-center px-3"
                : "gap-3 px-4"
        } ${
            isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
        }`;

    /*
    ============================================================
    ADMIN LOGOUT
    ============================================================
    */

    const handleAdminLogout = () => {
        // Remove ONLY the admin session
        localStorage.removeItem("electra_admin");

        // Close sidebar on mobile
        setSidebarOpen(false);

        // Send admin back to admin login
        navigate("/admin/login");
    };

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 z-50 h-screen
                    border-r border-gray-200 bg-white
                    transition-all duration-300 ease-in-out
                    ${
                        sidebarCollapsed
                            ? "w-20"
                            : "w-64"
                    }
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                <div className="flex h-full flex-col">

                    {/* Header */}
                    <div
                        className={`
                            flex h-20 shrink-0 items-center
                            border-b border-gray-100
                            transition-all duration-300
                            ${
                                sidebarCollapsed
                                    ? "justify-center px-3"
                                    : "justify-between px-6"
                            }
                        `}
                    >

                        <div className="flex items-center gap-3">

                            {/* Logo */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                                <span className="text-lg font-bold text-white">
                                    E
                                </span>
                            </div>

                            {/* Brand */}
                            <div
                                className={`
                                    overflow-hidden whitespace-nowrap
                                    transition-all duration-300
                                    ${
                                        sidebarCollapsed
                                            ? "w-0 opacity-0"
                                            : "w-auto opacity-100"
                                    }
                                `}
                            >
                                <h1 className="text-xl font-bold tracking-tight text-blue-600">
                                    ELECTRA
                                </h1>

                                <p className="text-xs text-gray-400">
                                    Admin Panel
                                </p>
                            </div>

                        </div>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                        >
                            <X size={22} />
                        </button>

                    </div>

                    {/* Navigation */}
                    <nav
                        className={`
                            flex flex-1 flex-col justify-center
                            transition-all duration-300
                            ${
                                sidebarCollapsed
                                    ? "px-3"
                                    : "px-4"
                            }
                        `}
                    >

                        <div>

                            {/* Section Title */}
                            <div
                                className={`
                                    overflow-hidden whitespace-nowrap
                                    transition-all duration-300
                                    ${
                                        sidebarCollapsed
                                            ? "mb-0 h-0 opacity-0"
                                            : "mb-3 h-auto opacity-100"
                                    }
                                `}
                            >
                                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Management
                                </p>
                            </div>

                            {/* Main Links */}
                            <div className="space-y-2">

                                {TabLinks.map((link) => {
                                    const Icon = link.icon;

                                    /*
                                    ========================================================
                                    PRODUCTS SUBMENU
                                    ========================================================
                                    */

                                    if (link.submenu) {
                                        return (
                                            <div key={link.name}>

                                                <button
                                                    onClick={() =>
                                                        setProductsOpen(
                                                            !productsOpen
                                                        )
                                                    }
                                                    className={`
                                                        flex w-full items-center rounded-xl py-3
                                                        text-sm font-medium transition-all duration-300
                                                        text-gray-600 hover:bg-blue-50 hover:text-blue-600
                                                        ${
                                                            sidebarCollapsed
                                                                ? "justify-center px-3"
                                                                : "justify-between px-4"
                                                        }
                                                    `}
                                                    title={
                                                        sidebarCollapsed
                                                            ? link.name
                                                            : undefined
                                                    }
                                                >

                                                    <div
                                                        className={`
                                                            flex items-center
                                                            ${
                                                                sidebarCollapsed
                                                                    ? "justify-center"
                                                                    : "gap-3"
                                                            }
                                                        `}
                                                    >

                                                        <Icon
                                                            size={20}
                                                            strokeWidth={2}
                                                            className="shrink-0"
                                                        />

                                                        <span
                                                            className={`
                                                                whitespace-nowrap
                                                                overflow-hidden
                                                                transition-all duration-300
                                                                ${
                                                                    sidebarCollapsed
                                                                        ? "w-0 opacity-0"
                                                                        : "w-auto opacity-100"
                                                                }
                                                            `}
                                                        >
                                                            {link.name}
                                                        </span>

                                                    </div>

                                                    {!sidebarCollapsed &&
                                                        (productsOpen ? (
                                                            <ChevronDown
                                                                size={18}
                                                            />
                                                        ) : (
                                                            <ChevronRight
                                                                size={18}
                                                            />
                                                        ))}

                                                </button>


                                                {/* Products Submenu */}
                                                {!sidebarCollapsed && (
                                                    <div
                                                        className={`
                                                            overflow-hidden
                                                            transition-all duration-300 ease-in-out
                                                            ${
                                                                productsOpen
                                                                    ? "max-h-48 opacity-100 translate-y-0 mt-2"
                                                                    : "max-h-0 opacity-0 -translate-y-2 mt-0"
                                                            }
                                                        `}
                                                    >

                                                        <div className="ml-5 space-y-1 border-l-2 border-blue-100 pl-4">

                                                            {link.submenu.map(
                                                                (
                                                                    subLink
                                                                ) => {
                                                                    const SubIcon =
                                                                        subLink.icon;

                                                                    return (
                                                                        <NavLink
                                                                            key={
                                                                                subLink.name
                                                                            }
                                                                            to={
                                                                                subLink.path
                                                                            }
                                                                            onClick={() =>
                                                                                setSidebarOpen(
                                                                                    false
                                                                                )
                                                                            }
                                                                            className={({
                                                                                isActive,
                                                                            }) =>
                                                                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                                                                    isActive
                                                                                        ? "bg-blue-50 font-medium text-blue-600"
                                                                                        : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                                                                                }`
                                                                            }
                                                                        >

                                                                            <SubIcon
                                                                                size={
                                                                                    17
                                                                                }
                                                                            />

                                                                            <span>
                                                                                {
                                                                                    subLink.name
                                                                                }
                                                                            </span>

                                                                        </NavLink>
                                                                    );
                                                                }
                                                            )}

                                                        </div>

                                                    </div>
                                                )}

                                            </div>
                                        );
                                    }

                                    /*
                                    ========================================================
                                    NORMAL LINKS
                                    ========================================================
                                    */

                                    return (
                                        <NavLink
                                            key={link.name}
                                            to={link.path}
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }
                                            className={
                                                navLinkClasses
                                            }
                                            title={
                                                sidebarCollapsed
                                                    ? link.name
                                                    : undefined
                                            }
                                        >

                                            <Icon
                                                size={20}
                                                strokeWidth={2}
                                                className="shrink-0"
                                            />

                                            <span
                                                className={`
                                                    whitespace-nowrap
                                                    overflow-hidden
                                                    transition-all duration-300
                                                    ${
                                                        sidebarCollapsed
                                                            ? "w-0 opacity-0"
                                                            : "w-auto opacity-100"
                                                    }
                                                `}
                                            >
                                                {link.name}
                                            </span>

                                        </NavLink>
                                    );
                                })}

                            </div>

                        </div>

                    </nav>


                    {/* Settings */}
                    <div
                        className={`
                            shrink-0 pb-[10px]
                            transition-all duration-300
                            ${
                                sidebarCollapsed
                                    ? "px-3"
                                    : "px-4"
                            }
                        `}
                    >

                        <button
                            onClick={() =>
                                setSettingsOpen(
                                    !settingsOpen
                                )
                            }
                            className={`
                                flex w-full items-center rounded-xl py-3
                                text-sm font-medium text-gray-600
                                transition-all duration-200
                                hover:bg-blue-50 hover:text-blue-600
                                ${
                                    sidebarCollapsed
                                        ? "justify-center px-3"
                                        : "justify-between px-4"
                                }
                            `}
                            title={
                                sidebarCollapsed
                                    ? "Settings"
                                    : undefined
                            }
                        >

                            <div
                                className={`
                                    flex items-center
                                    ${
                                        sidebarCollapsed
                                            ? "justify-center"
                                            : "gap-3"
                                    }
                                `}
                            >

                                <Settings
                                    size={20}
                                    strokeWidth={2}
                                />

                                <span
                                    className={`
                                        whitespace-nowrap overflow-hidden
                                        transition-all duration-300
                                        ${
                                            sidebarCollapsed
                                                ? "w-0 opacity-0"
                                                : "w-auto opacity-100"
                                        }
                                    `}
                                >
                                    Settings
                                </span>

                            </div>

                            {!sidebarCollapsed &&
                                (settingsOpen ? (
                                    <ChevronDown
                                        size={18}
                                    />
                                ) : (
                                    <ChevronRight
                                        size={18}
                                    />
                                ))}

                        </button>


                        {/* Settings Submenu */}
                        {!sidebarCollapsed && (
                            <div
                                className={`
                                    overflow-hidden
                                    transition-all duration-300 ease-in-out
                                    ${
                                        settingsOpen
                                            ? "max-h-48 opacity-100 translate-y-0 mt-2"
                                            : "max-h-0 opacity-0 -translate-y-2 mt-0"
                                    }
                                `}
                            >

                                <div className="ml-5 space-y-1 border-l-2 border-blue-100 pl-4">

                                    {/* Profile */}

                                    <NavLink
                                        to="/admin/settings/profile"
                                        onClick={() =>
                                            setSidebarOpen(
                                                false
                                            )
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                                isActive
                                                    ? "bg-blue-50 font-medium text-blue-600"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                                            }`
                                        }
                                    >

                                        <User size={17} />

                                        <span>
                                            Profile
                                        </span>

                                    </NavLink>


                                    {/* Log out */}

                                    <button
                                        onClick={
                                            handleAdminLogout
                                        }
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-red-500"
                                    >

                                        <LogOut
                                            size={17}
                                        />

                                        <span>
                                            Log out
                                        </span>

                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>
            </aside>
        </>
    );
};

export default Sidebar;