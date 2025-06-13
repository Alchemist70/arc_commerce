import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    console.log("AdminRoute check:", {
      user: user ? "Present" : "Missing",
      isAdmin: user?.isAdmin,
      path: location.pathname,
    });
  }, [location.pathname, user]);

  if (!user || !user.isAdmin) {
    console.log("Unauthorized access attempt to admin route");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
