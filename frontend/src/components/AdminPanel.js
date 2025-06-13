import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../styles/AdminPanel.css";

const AdminPanel = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2 className="word">Admin Dashboard</h2>
        <nav className="admin-nav">
          <Link
            to="/admin/products"
            className={`nav-item ${
              isActive("/admin/products") ? "active" : ""
            }`}
          >
            <i className="fas fa-box"></i>
            Products Management
          </Link>
          <Link
            to="/admin/users"
            className={`nav-item ${isActive("/admin/users") ? "active" : ""}`}
          >
            <i className="fas fa-users"></i>
            User Management
          </Link>
          <Link
            to="/admin/categories"
            className={`nav-item ${
              isActive("/admin/categories") ? "active" : ""
            }`}
          >
            <i className="fas fa-list"></i>
            Categories
          </Link>
          <Link
            to="/admin/orders"
            className={`nav-item ${isActive("/admin/orders") ? "active" : ""}`}
          >
            <i className="fas fa-shopping-cart"></i>
            Orders
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Welcome, Admin</h1>
          <Link to="/" className="back-to-site">
            Back to Site
          </Link>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
