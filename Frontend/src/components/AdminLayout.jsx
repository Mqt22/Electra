import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <>
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                sidebarCollapsed={sidebarCollapsed}
            />

            <div
                className={`
                    min-h-screen
                    transition-all duration-300 ease-in-out
                    ${
                        sidebarCollapsed
                            ? "lg:pl-20"
                            : "lg:pl-64"
                    }
                `}
            >
                <Topbar
                    setSidebarOpen={setSidebarOpen}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                />

                <Outlet />
            </div>
        </>
    );
};

export default AdminLayout;