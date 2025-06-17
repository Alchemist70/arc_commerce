import React, { useState } from "react";
import SignupForm from "../components/SignupForm";

const Signup = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5002"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, phone, password, admin_code: adminCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setSuccess(data.isAdmin ? "Admin account created successfully!" : "Account created successfully!");
      setFullname("");
      setEmail("");
      setPhone("");
      setPassword("");
      setAdminCode("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Full Name" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <input type="text" value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="Admin Code (optional)" />
        <button type="submit" disabled={isLoading}>{isLoading ? "Signing up..." : "Sign Up"}</button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
};

export default Signup;
