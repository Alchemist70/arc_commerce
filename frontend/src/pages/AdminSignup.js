import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminAuth.css";

const AdminSignup = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5002"}/api/auth/admin-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setSuccess("Admin account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/admin-login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-auth-bg">
      <div className="admin-auth-card">
        <h2 className="admin-auth-title">Admin Registration</h2>
        <form onSubmit={handleSubmit} className="admin-auth-form">
          <input type="text" value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Full Name" required className="admin-auth-input" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="admin-auth-input" />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" required className="admin-auth-input" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="admin-auth-input" />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required className="admin-auth-input" />
          <button type="submit" className="admin-auth-btn" disabled={isLoading}>{isLoading ? "Registering..." : "Register as Admin"}</button>
          {error && <div className="admin-auth-error">{error}</div>}
          {success && <div className="admin-auth-success">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminSignup; 