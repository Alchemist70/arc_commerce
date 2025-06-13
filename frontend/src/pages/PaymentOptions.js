import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSummary from "../components/OrderSummary";
import axios from "axios";
import "../styles/PaymentOptions.css";
import "../styles/common.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

const PaymentOptions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shipping, total } = location.state || {};
  const [cartItems, setCartItems] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
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
        // Log the raw response
        console.log("Cart API response:", response.data);
        // Map the cart items to ensure product_id is present and not overwritten
        const mapped = response.data.map(item => ({
          ...item,
          id: item.cart_item_id,
          product_id: item.product_id || item.productId,
        }));
        setCartItems(mapped);
        // Log the mapped cart items
        console.log("Mapped cart items:", mapped);
      } catch (err) {
        setError("Failed to load cart items. Please try again.");
      }
    };
    fetchCart();
  }, []);

  const handlePayNow = () => {
    navigate("/payment", { state: { shipping, cartItems, total, paymentMethod: "card" } });
  };

  const handlePayOnDelivery = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to place your order.");
        setLoading(false);
        return;
      }

      // Log cart items before placing order
      console.log("Cart items before placing order:", cartItems);

      // Always use the mapped cartItems from state
      const orderItems = cartItems.map((item) => {
        if (!item.product_id) {
          console.error("Missing product_id for item:", item);
          throw new Error("Invalid cart item: missing product_id");
        }
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price),
        };
      });

      console.log("Order items to send:", orderItems);

      const orderData = {
        items: orderItems,
        shipping,
        total: parseFloat(total),
        paymentMethod: "pay_on_delivery",
        paymentStatus: "pending",
      };

      console.log("Final order data:", orderData);

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
      // navigate("/order-confirmation", { state: { order: orderResponse.data.order || orderData, cartItems, total, payOnDelivery: true } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setError("");
    if (selectedOption === "paynow") {
      handlePayNow();
    } else if (selectedOption === "cod") {
      handlePayOnDelivery();
    } else {
      setError("Please select a payment option.");
    }
  };

  return (
    <div className="payment-options-container">
      <h2 className="payment-options-title">Choose Payment Option</h2>
      {error && <div className="error-message">{error}</div>}
      <OrderSummary cartItems={cartItems} total={total} />
      <form onSubmit={handlePlaceOrder} className="payment-form">
        <div className="payment-options-group">
          <label className="payment-option-label">
            <input 
              type="radio" 
              name="paymentOption" 
              value="cod" 
              checked={selectedOption === "cod"} 
              onChange={() => setSelectedOption("cod")}
            />
            Pay on Delivery
          </label>
          <label className="payment-option-label">
            <input 
              type="radio" 
              name="paymentOption" 
              value="paynow" 
              checked={selectedOption === "paynow"} 
              onChange={() => setSelectedOption("paynow")}
            />
            Pay Now
          </label>
        </div>
        <div className="button-group">
          <button 
            type="button" 
            className="back-button" 
            onClick={() => navigate("/checkout")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <h2 className="success-modal-title">Order Placed!</h2>
            <p className="success-modal-message">
              Your order has been successfully placed!<br />
              Thanks for your patronage.<br />
              A confirmation message has been sent to your registered email at <b>{successEmail}</b>.
            </p>
            <button 
              onClick={() => { 
                setShowSuccessModal(false); 
                navigate("/order-confirmation", { 
                  state: { order: {}, cartItems, total, payOnDelivery: true } 
                }); 
              }} 
              className="success-modal-button"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions; 