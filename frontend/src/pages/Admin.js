import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "../components/AdminPanel";
import Header from "../components/Header";
import "../styles/Admin.css";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      if (!token || !user.isAdmin) {
        console.log("Not authenticated as admin");
        navigate("/login");
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [navigate]);

  if (!isAuthenticated) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <AdminPanel />
      </div>
    </div>
  );
};

export default Admin;
