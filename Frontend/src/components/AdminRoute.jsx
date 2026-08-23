import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const storedAdmin = localStorage.getItem("electra_admin");

  if (!storedAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const admin = JSON.parse(storedAdmin);

    if (!admin?.user_id || !admin?.name) {
      localStorage.removeItem("electra_admin");
      return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    localStorage.removeItem("electra_admin");
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminRoute;