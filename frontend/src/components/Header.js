import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faHeart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

const Header = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user data and token when component mounts
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchCartCount();
    } else {
      setUser(null);
    }

    // Listen for cart updates in localStorage
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      const currentToken = localStorage.getItem("token");

      if (updatedUser && currentToken) {
        setUser(JSON.parse(updatedUser));
        fetchCartCount(); // Refresh cart count on changes
      } else {
        setUser(null);
        setCartCount(0);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch cart items count
  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartCount(0);
        return;
      }
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartCount(response.data.length); // Update count based on cart items
    } catch {
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCartCount(0);
    navigate("/");
  };

  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <header className="top-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <FontAwesomeIcon icon={faShoppingCart} />
          <div className="logo-text">
            <div>
              <span>ARS</span> Kart
            </div>
            <div className="logo-subtitle">ELECTRONICS HUB</div>
          </div>
        </Link>

        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="What are you looking for today?"
          />
          <button className="search-button">Search</button>
        </div>

        <div className="header-buttons">
          {user ? (
            <div className="user-section">
              <span
                className="username"
                onClick={() => navigate('/profile')}
                title="Profile"
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faUser} /> {user.fullname}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="signin-link">
              <button className="signin-btn">Sign In</button>
            </Link>
          )}

          <div className="nav-icons">
            <a
              href="/wishlist"
              onClick={handleNavigation("/wishlist")}
              className="nav-icon"
            >
              <FontAwesomeIcon icon={faHeart} /> Wishlist
            </a>
            <a
              href="/cart"
              onClick={handleNavigation("/cart")}
              className="nav-icon cart-icon"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              Cart
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
