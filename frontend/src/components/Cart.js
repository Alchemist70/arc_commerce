import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Cart.css";
import "../styles/common.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Import default images for different categories
import mobileDefault from "../assets/mobile-default.jpg";
import laptopDefault from "../assets/laptop-default.jpg";
import audioDefault from "../assets/audio-default.jpg";
import tvDefault from "../assets/tv-default.jpg";
import tabletDefault from "../assets/tablet-default.jpg";
import defaultImage from "../assets/default-product.jpg";

// Hardcoded baseURL for production
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5002";

// Create axios instance with default config
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 5000,
  validateStatus: (status) => {
    return status >= 200 && status < 500; // Resolve for any status less than 500
  },
});

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get default image based on category
  const getCategoryImage = (category) => {
    if (!category) return defaultImage;

    const categoryImages = {
      mobiles: mobileDefault,
      laptops: laptopDefault,
      audio: audioDefault,
      "smart tvs": tvDefault,
      tablets: tabletDefault,
      default: defaultImage,
    };

    return categoryImages[category.toLowerCase()] || categoryImages.default;
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your cart");
        setLoading(false);
        return;
      }

      const response = await api.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        console.error("Authentication error:", response.data);
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        return;
      }

      if (response.status === 403) {
        console.error("Authorization error:", response.data);
        setError("You don't have permission to access this cart.");
        return;
      }

      if (response.status === 404) {
        console.error("Not found error:", response.data);
        setError("Cart not found. Please try again later.");
        return;
      }

      if (!response.data) {
        console.error("No data received from server");
        throw new Error("No data received from server");
      }

      setCartItems(
        response.data.map((item) => {
          // Always use string for productId
          const productId = (
            item.product_id ||
            item.productId ||
            item.id ||
            ""
          ).toString();
          const mapped = {
            ...item,
            id: item.cart_item_id,
            productId,
            product_id: productId,
          };
          console.log("[Cart] mapped cart item:", mapped);
          return mapped;
        })
      );
      setError(null);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    console.error("Cart Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.code === "ECONNABORTED") {
      setError("Request timed out. Please try again.");
    } else if (!error.response) {
      setError("Network error. Please check your connection.");
    } else {
      setError(
        error.response?.data?.message ||
          "Failed to load cart items. Please try again later."
      );
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    // productId is already a string
    console.log("[Cart] updateQuantity called", {
      productId,
      type: typeof productId,
      newQuantity,
    });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to update your cart");
        return;
      }

      if (newQuantity < 1) {
        await removeFromCart(productId);
        return;
      }

      const response = await api.put(
        `/api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.productId === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        throw new Error(response.data?.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(
        error.response?.data?.message ||
          "Failed to update quantity. Please try again."
      );
    } finally {
      fetchCartItems();
    }
  };

  const removeFromCart = async (productId) => {
    // productId is already a string
    console.log("[Cart] removeFromCart called", {
      productId,
      type: typeof productId,
    });
    const confirmed = window.confirm(
      "Are you sure you want to remove this item from your cart?"
    );
    if (!confirmed) return;
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to manage your cart");
        return;
      }
      const response = await api.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert(
        error.response?.data?.message ||
          "Failed to remove item from cart. Please try again."
      );
    } finally {
      fetchCartItems();
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    // Map cart items to ensure productId and product_id are set
    const checkoutItems = cartItems.map((item) => ({
      ...item,
      productId: item.product_id || item.productId,
      product_id: item.product_id || item.productId,
    }));

    navigate("/checkout", {
      state: {
        cartItems: checkoutItems,
        total: calculateTotal(),
      },
    });
  };

  useEffect(() => {
    fetchCartItems();
  }, [location.pathname]);

  if (loading) return <div className="loading">Loading cart...</div>;
  if (error) return <div className="error">{error}</div>;
  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-state">
          <FontAwesomeIcon icon={faShoppingCart} className="empty-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Browse our products and add items to your cart!</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>My Cart</h2>
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image_url || getCategoryImage(item.category)}
                alt={item.name}
                className="product-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCategoryImage(item.category);
                }}
              />
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="brand">{item.brand}</p>
                <p className="price">${item.price}</p>
                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Remove
                </button>
              </div>
              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div className="total">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/")}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Shop
            </button>
            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
