import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("ProtectedRoute check:", {
      user: user ? "Present" : "Missing",
      token: token ? "Present" : "Missing",
      path: location.pathname,
    });
  }, [location.pathname, user, token]);

  if (!user || !token) {
    console.log("Unauthorized access attempt to protected route");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
