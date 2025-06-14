import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Hardcoded API URL for production
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        console.log("🔍 Stored user:", storedUser);
        console.log("🔍 Stored token:", token);

        if (!storedUser || !token) {
          setError("Please log in to view your profile.");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        console.log("✅ Parsed user object:", parsedUser);

        setUser(parsedUser);
        fetchAddress(token);
      } catch (err) {
        console.error("❌ Error loading user data:", err);
        setError("Error loading profile data");
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const fetchAddress = async (token) => {
    try {
      console.log("📡 Fetching address with token:", token);
      const res = await axios.get(`${API_URL}/api/users/address`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Address fetch result:", res.data);
      if (res.data && res.data.address) {
        setAddress(res.data.address);
      }
    } catch (err) {
      console.error("❌ Error fetching address:", err.response?.data || err.message);
      setError("Failed to fetch address. Please make sure you're logged in.");
    } finally {
      console.log("🟢 Address fetch completed");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to save your address");
        return;
      }

      await axios.post(`${API_URL}/api/users/address`, address, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Address saved successfully!");
    } catch (err) {
      console.error("❌ Error saving address:", err);
      setMessage(err.response?.data?.error || err.response?.data?.message || "Failed to save address.");
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "200px" }}>Loading...</div>;
  if (!user && !loading)
    return (
      <div style={{ textAlign: "center", marginTop: "200px", color: "red" }}>
        {error || "Please log in to view your profile."}
      </div>
    );

  return (
    <div
      className="profile-container"
      style={{
        maxWidth: 500,
        margin: "200px auto",
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}
    >
      <h2>User Profile</h2>
      <div>
        <strong>Name:</strong> {user.fullname}
      </div>
      <div>
        <strong>Email:</strong> {user.email}
      </div>
      <div>
        <strong>Phone:</strong> {user.phone}
      </div>

      <h3 style={{ marginTop: 32 }}>Shipping Address</h3>
      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={address.address}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>State</label>
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>ZIP Code</label>
          <input
            type="text"
            name="zipCode"
            value={address.zipCode}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 24px",
            background: "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontWeight: 600
          }}
        >
          Save Address
        </button>
      </form>
      {message && (
        <div
          style={{
            marginTop: 16,
            color: message.includes("success") ? "green" : "red"
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
