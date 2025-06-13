import React, { useState, useEffect } from "react";
import "../styles/UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/toggle-admin`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      await fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <h3>{user.fullname}</h3>
              <p>{user.email}</p>
              <span className={`status ${user.isAdmin ? "admin" : "user"}`}>
                {user.isAdmin ? "Admin" : "User"}
              </span>
            </div>
            <button
              onClick={() => toggleAdminStatus(user.id)}
              className={user.isAdmin ? "revoke-btn" : "promote-btn"}
            >
              {user.isAdmin ? "Revoke Admin" : "Make Admin"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
