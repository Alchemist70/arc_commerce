import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminAuth.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5002"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (!data.user.is_admin) {
        setError("You are not an admin.");
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-auth-bg">
      <div className="admin-auth-card">
        <h2 className="admin-auth-title">Admin Login</h2>
        <form onSubmit={handleSubmit} className="admin-auth-form">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" required className="admin-auth-input" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="admin-auth-input" />
          <button type="submit" className="admin-auth-btn">Login as Admin</button>
          {error && <div className="admin-auth-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 