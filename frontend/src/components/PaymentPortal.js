import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/PaymentPortal.css";
import "../styles/common.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faMoneyBill,
  faLock,
  faCheckCircle,
  faTruck,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

// Hardcoded baseURL for production
const baseURL = "https://ars-commercess.onrender.com";

// Create axios instance with default config
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

const PaymentPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { total } = location.state || { total: 0 };
  const [cartItems, setCartItems] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [shippingDetails, setShippingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState("shipping"); // 'shipping' or 'payment'

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await api.get("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(
          response.data.map(item => ({
            ...item,
            productId: item.product_id,
            product_id: item.product_id,
            id: item.cart_item_id
          }))
        );
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCart();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in cardDetails) {
      setCardDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setShippingDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const validateShippingDetails = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
    ];
    for (const field of required) {
      if (!shippingDetails[field]) {
        alert(
          `Please fill in your ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`
        );
        return false;
      }
    }
    return true;
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    if (validateShippingDetails()) {
      setCurrentStep("payment");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateShippingDetails()) return;
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to complete your purchase");
      }

      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Your cart is empty");
      }

      // Create order with payment method and shipping details
      const orderData = {
        items: cartItems.map((item) => {
          // Ensure we have the product ID from either source
          const productId = item.product_id || item.productId;
          if (!productId) {
            console.error("Missing product_id for item:", item);
            throw new Error("Invalid cart item: missing product_id");
          }
          return {
            product_id: productId,
          quantity: item.quantity,
          price: item.price,
          };
        }),
        total: parseFloat(total),
        paymentMethod: selectedMethod === "CC" ? "1" : "2",
        paymentStatus: selectedMethod === "CC" ? "paid" : "pending",
        shipping: shippingDetails,
        ...(selectedMethod === "CC" && { cardDetails }),
      };

      // Log the exact data being sent
      console.log("Sending order data:", JSON.stringify(orderData, null, 2));

      const response = await api.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Order creation response:", response.data);

      // Clear cart after successful order
      await api.delete("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/orders");
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error.response || error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to process payment. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-portal">
      <div className="payment-container">
        <div className="secure-badge">
          <FontAwesomeIcon icon={faLock} />
          <span>Secure Checkout</span>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {currentStep === "shipping" ? (
          <div className="shipping-section">
            <h3>
              <FontAwesomeIcon icon={faTruck} /> Shipping Information
            </h3>
            <form onSubmit={handleContinueToPayment} className="shipping-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingDetails.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingDetails.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={shippingDetails.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingDetails.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingDetails.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="button-group">
                <button 
                  type="button" 
                  className="back-button" 
                  onClick={() => navigate("/payment-options")}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back
                </button>
              <button type="submit" className="continue-button">
                Continue to Payment
              </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              <div className="payment-options">
                <div
                  className={`payment-option ${
                    selectedMethod === "CC" ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentMethodSelect("CC")}
                >
                  <FontAwesomeIcon icon={faCreditCard} />
                  <span>Pay Now</span>
                  <p>Pay securely with your credit card</p>
                </div>
                <div
                  className={`payment-option ${
                    selectedMethod === "COD" ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentMethodSelect("COD")}
                >
                  <FontAwesomeIcon icon={faMoneyBill} />
                  <span>Pay on Delivery</span>
                  <p>Cash payment upon delivery</p>
                </div>
              </div>
            </div>

            {selectedMethod === "CC" && (
              <form className="card-details-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    required
                    maxLength="19"
                  />
                </div>
                <div className="form-group">
                  <label>Card Holder Name</label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      required
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      required
                      maxLength="3"
                    />
                  </div>
                </div>
              </form>
            )}

            <div className="button-group">
              <button
                type="button" 
                className="back-button"
                onClick={() => setCurrentStep("shipping")}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Shipping
              </button>
              <button
                className={`pay-button ${loading ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={!selectedMethod || loading}
              >
                {loading ? "Processing..." : `Pay ${total.toFixed(2)} USD`}
              </button>
            </div>
          </>
        )}
      </div>

      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-content">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <h3>Payment Successful!</h3>
            <p>Your order has been placed successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPortal;
