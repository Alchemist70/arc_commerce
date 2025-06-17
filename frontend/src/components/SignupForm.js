import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/SignupForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    admin_code: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Use environment variable for API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Attempting to connect to:", `${API_URL}/api/auth/register`);

    try {
      // Add loading state feedback to user
      const submitButton = e.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Signing up...";

      // Log the request data
      console.log("Sending registration data:", {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
      });

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          admin_code: formData.admin_code || undefined,
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(8000),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      // Try to get the raw response text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        // Try to parse the error response
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage =
            errorData.message || `HTTP error! status: ${response.status}`;
        } catch (e) {
          errorMessage = `Server error (${response.status}): ${responseText}`;
        }
        throw new Error(errorMessage);
      }

      // Try to parse the success response
      try {
        const data = JSON.parse(responseText);
        console.log("Registration successful:", data);
        if (data.isAdmin) {
          alert("Admin account created successfully!");
        }
        setShowModal(true);
      } catch (parseError) {
        console.error("Failed to parse success response:", parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.name === "TimeoutError") {
        alert(
          "Registration failed: Server is not responding. Please try again later."
        );
      } else if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        alert(
          "Unable to connect to the server. Please check if the server is running."
        );
      } else {
        alert(`Registration failed: ${error.message}`);
      }
    } finally {
      // Reset button state
      const submitButton = e.target.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = "Sign Up";
    }
  };

  return (
    <>
      {/* Header */}
      <header className="top-header">
        <div className="header-container">
          <Link to="/Home" className="logo">
            <FontAwesomeIcon icon={faShoppingCart} />
            <div className="logo-text">
              <div>
                <span>ARS</span> Kart
              </div>
              <div className="logo-subtitle">ELECTRONICS HUB</div>
            </div>
          </Link>
        </div>
      </header>

      {/* Signup Form */}
      <div className="signup-container">
        <div className="signup-box">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Admin Code (optional)</label>
              <input
                type="text"
                name="admin_code"
                value={formData.admin_code}
                onChange={handleChange}
                placeholder="Enter admin code if you have one"
              />
            </div>

            <div className="input-group password-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>

            <div className="input-group password-group">
              <label>Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>
            </div>

            <button type="submit" className="signup-btn">
              Sign Up
            </button>

            <p className="login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        message="Registration Successful. You'll be redirected to the login page"
        onClose={handleModalClose}
      />
    </>
  );
};

export default SignupForm;
