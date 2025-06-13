import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSummary from "../components/OrderSummary";
import axios from "axios";

// Hardcoded API URL for production
const API_URL = "https://ars-commercess.onrender.com";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shipping, total, paymentMethod } = location.state || {};
  const [cartItems, setCartItems] = useState([]);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(
          response.data.map(item => ({
            ...item,
            id: item.cart_item_id,
            product_id: item.product_id || item.productId,
          }))
        );
      } catch (err) {
        setError("Failed to load cart items. Please try again.");
      }
    };
    fetchCart();
  }, []);

  const handleInputChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to complete your purchase.");
        setLoading(false);
        return;
      }
      const orderData = {
        items: cartItems.map((item) => {
          const productId = item.product_id || item.productId;
          if (!productId) {
            console.error("Missing product_id for item:", item);
            throw new Error("Invalid cart item: missing product_id");
          }
          return {
            product_id: productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
          };
        }),
        shipping,
        total: parseFloat(total),
        paymentMethod: "card",
        paymentStatus: "paid",
        cardDetails,
      };
      const orderResponse = await axios.post(
        `${API_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Clear cart after successful order
      try {
        await axios.delete(`${API_URL}/api/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
      // Show success modal with email
      setSuccessEmail(shipping?.email || "your email");
      setShowSuccessModal(true);
      // Do not navigate immediately; wait for user to click Okay
      // navigate("/order-confirmation", { state: { order: orderResponse.data.order || orderData, cartItems, total, payOnDelivery: false } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to process payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '170px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 32, textAlign: 'center' }}>
      <h2 style={{ color: '#1a237e', fontWeight: 700, marginBottom: 24 }}>Payment</h2>
      {error && <div style={{ background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 4, marginBottom: 18 }}>{error}</div>}
      <OrderSummary cartItems={cartItems} total={total} />
      <form onSubmit={handleSubmit} style={{ marginTop: 32, textAlign: 'left' }}>
        <div style={{ marginBottom: 18 }}>
          <label>Card Number</label>
          <input type="text" name="cardNumber" value={cardDetails.cardNumber} onChange={handleInputChange} required maxLength={19} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Card Holder</label>
          <input type="text" name="cardHolder" value={cardDetails.cardHolder} onChange={handleInputChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <label>Expiry Date</label>
            <input type="text" name="expiryDate" value={cardDetails.expiryDate} onChange={handleInputChange} required maxLength={5} placeholder="MM/YY" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>CVV</label>
            <input type="text" name="cvv" value={cardDetails.cvv} onChange={handleInputChange} required maxLength={3} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
          </div>
        </div>
        <button type="submit" style={{ padding: '12px 28px', background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer', width: 200 }} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem 2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', textAlign: 'center', minWidth: 340 }}>
            <h2 style={{ color: '#43a047', fontWeight: 700, marginBottom: 18 }}>Order Placed!</h2>
            <p style={{ fontSize: 17, color: '#333', marginBottom: 24 }}>
              Your order has been successfully placed!<br />
              Thanks for your patronage.<br />
              A confirmation message has been sent to your registered email at <b>{successEmail}</b>.
            </p>
            <button onClick={() => { setShowSuccessModal(false); navigate("/order-confirmation", { state: { order: {}, cartItems, total, payOnDelivery: false } }); }} style={{ padding: '10px 32px', background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Okay</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment; 