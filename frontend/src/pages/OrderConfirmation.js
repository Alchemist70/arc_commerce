import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSummary from "../components/OrderSummary";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, cartItems, total } = location.state || {};

  return (
    <div style={{ maxWidth: 600, margin: '80px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 32, textAlign: 'center' }}>
      <h2 style={{ color: '#43a047', fontWeight: 700, marginBottom: 24 }}>Order Confirmed!</h2>
      <p style={{ fontSize: 18, color: '#333', marginBottom: 24 }}>Thank you for your order. Your order has been placed and will be delivered soon.</p>
      <OrderSummary cartItems={cartItems} total={total} />
      <button onClick={() => navigate("/")} style={{ marginTop: 32, padding: '12px 28px', background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Continue Shopping</button>
    </div>
  );
};

export default OrderConfirmation; 