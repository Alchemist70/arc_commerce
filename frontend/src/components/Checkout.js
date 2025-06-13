import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Checkout.css";
import OrderSummary from "./OrderSummary";

// Hardcoded API URL for production
const API_URL = "https://ars-commercess.onrender.com";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, total } = location.state || { cartItems: [], total: 0 };

  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [profileAddress, setProfileAddress] = useState(null);
  const [customAddress, setCustomAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }
    fetchProfileAddress();
  }, [cartItems, navigate]);

  const fetchProfileAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/users/address`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.address) {
        setProfileAddress(res.data.address);
      }
    } catch (err) {
      setProfileAddress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAddressChange = (e) => {
    setCustomAddress({ ...customAddress, [e.target.name]: e.target.value });
  };

  const handleAddressOptionChange = (e) => {
    setUseProfileAddress(e.target.value === "profile");
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError(null);
    const nameParts = (storedUser.fullname || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";
    let shipping = {
      ...(useProfileAddress ? profileAddress : customAddress),
      firstName,
      lastName,
      email: storedUser.email || "",
    };
    if (
      !shipping.address ||
      !shipping.city ||
      !shipping.state ||
      !shipping.zipCode ||
      !shipping.firstName ||
      !shipping.email
    ) {
      setError("Please fill in all address fields.");
      return;
    }
    navigate("/payment-options", { state: { shipping, cartItems, total } });
  };

  if (loading) return <div>Loading...</div>;
  if (orderSuccess) return (
      <div className="checkout-success">
        <h2>Order Placed Successfully!</h2>
      <p>Thank you for your purchase.</p>
      <button className="continue-shopping-btn" onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    );

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleNext}>
          <div className="form-section">
            <h3>Delivery Address</h3>
            <div style={{ marginBottom: 16 }}>
              <label>
                <input
                  type="radio"
                  name="addressOption"
                  value="profile"
                  checked={useProfileAddress}
                  onChange={handleAddressOptionChange}
                />
                Use my profile address
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="addressOption"
                  value="custom"
                  checked={!useProfileAddress}
                  onChange={handleAddressOptionChange}
                />
                Use a different address
              </label>
            </div>
            {useProfileAddress && profileAddress ? (
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                <div><strong>Address:</strong> {profileAddress.address}</div>
                <div><strong>City:</strong> {profileAddress.city}</div>
                <div><strong>State:</strong> {profileAddress.state}</div>
                <div><strong>ZIP Code:</strong> {profileAddress.zipCode}</div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
              <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={customAddress.address} onChange={handleCustomAddressChange} required={!useProfileAddress} />
              </div>
              <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={customAddress.city} onChange={handleCustomAddressChange} required={!useProfileAddress} />
            </div>
            <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" value={customAddress.state} onChange={handleCustomAddressChange} required={!useProfileAddress} />
              </div>
              <div className="form-group">
                  <label>ZIP Code</label>
                  <input type="text" name="zipCode" value={customAddress.zipCode} onChange={handleCustomAddressChange} required={!useProfileAddress} />
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="place-order-btn" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? "Processing..." : "Next"}
          </button>
        </form>
        <OrderSummary cartItems={cartItems} total={total} />
      </div>
    </div>
  );
};

export default Checkout;
