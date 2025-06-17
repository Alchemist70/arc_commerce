import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Import CSS file
import googleLogo from "../assets/google-logo.png"; // Import Google logo

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Use environment variable for API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Starting login process...");
      console.log("Email:", email);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Login response data:", {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        isAdmin: data.user?.is_admin,
      });

      if (!response.ok) {
        console.error("Login failed:", data);
        setError(
          data.message || "Login failed. Please check your credentials."
        );
        return;
      }

      if (!data.token) {
        console.error("No token received in response");
        setError("Server error: No authentication token received");
        return;
      }

      if (!data.user) {
        console.error("No user data received in response");
        setError("Server error: No user data received");
        return;
      }

      // Store user data and token
      console.log("Storing user data and token...");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Verify storage
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      console.log("Storage verification:", {
        userStored: !!storedUser,
        tokenStored: !!storedToken,
        parsedUser: JSON.parse(storedUser),
      });

      // Check if user data contains isAdmin property
      if (data.user && data.user.is_admin) {
        console.log("Admin user detected, redirecting to admin panel");
        navigate("/admin");
      } else {
        console.log("Regular user detected, redirecting to home");
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Unable to connect to server. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="top-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <i className="fas fa-shopping-cart"></i>
            <div className="logo-text">
              <div>
                <span>ARS</span> Kart
              </div>
              <div className="logo-subtitle">ELECTRONICS HUB</div>
            </div>
          </Link>
        </div>
      </header>

      {/* Login Section */}
      <div className="login-container">
        <div className="login-box">
          {/* Left Side */}
          <div className="login-left">
            <h2>Welcome Back!</h2>
            <p>
              Sign in to access your Orders, Wishlist, and get personalized
              recommendations.
            </p>
          </div>

          {/* Right Side */}
          <div className="login-right">
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button type="submit" className="signin-btn" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <button className="google-signin">
              <img src={googleLogo} alt="Google logo" />
              Sign in with Google
            </button>

            <p className="terms">
              By continuing, you agree to ARS Kart's{" "}
              <Link to="/terms">Terms</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>

            <div className="create-account">
              <Link to="/signup">
                New to ARS Kart? <strong>Create an account</strong>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
