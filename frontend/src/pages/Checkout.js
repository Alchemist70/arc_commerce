import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Checkout.css";
import "../styles/common.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Checkout = () => {
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Validate form
    const required = ["firstName", "lastName", "email", "address", "city", "state", "zipCode"];
    const isValid = required.every(field => shippingInfo[field].trim() !== "");
    setIsFormValid(isValid);
  }, [shippingInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    navigate("/payment-options", { state: { shipping: shippingInfo } });
  };

  return (
    <div className="checkout-container">
      <h2>Shipping Information</h2>
      <form className="checkout-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={shippingInfo.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={shippingInfo.lastName}
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
            value={shippingInfo.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={shippingInfo.address}
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
              value={shippingInfo.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={shippingInfo.state}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>ZIP Code</label>
            <input
              type="text"
              name="zipCode"
              value={shippingInfo.zipCode}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="button-group">
          <button 
            type="button" 
            className="back-button" 
            onClick={() => navigate("/cart")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Cart
          </button>
          <button 
            type="button"
            className="next-button" 
            onClick={handleNext}
            disabled={!isFormValid}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout; 