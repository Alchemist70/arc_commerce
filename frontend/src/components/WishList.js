import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Wishlist.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

// Import default images for different categories
import mobileDefault from "../assets/mobile-default.jpg";
import laptopDefault from "../assets/laptop-default.jpg";
import audioDefault from "../assets/audio-default.jpg";
import tvDefault from "../assets/tv-default.jpg";
import tabletDefault from "../assets/tablet-default.jpg";
import defaultImage from "../assets/default-product.jpg";

// Hardcoded API URL for production
const API_URL = "https://ars-commercess.onrender.com";

const WishList = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get default image based on category
  const getCategoryImage = (category) => {
    if (!category) return defaultImage; // If category is undefined

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

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your wishlist");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems(response.data);
    } catch (error) {
      setError("Failed to load wishlist items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setError("Please log in to manage your wishlist");
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems(
        wishlistItems.filter((item) => item.product_id !== productId)
      );
    } catch {
      alert("Failed to remove item from wishlist. Please try again.");
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in to add items to cart");
      await axios.post(
        `${API_URL}/api/cart`,
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Added to cart successfully!");
      removeFromWishlist(productId);
    } catch {
      alert("Failed to add to cart. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;
  if (error) return <div className="error">{error}</div>;
  if (wishlistItems.length === 0) {
    return (
      <div className="empty-wishlist">
        <div className="empty-state">
          <FontAwesomeIcon icon={faHeart} className="empty-icon" />
          <h2>Your Wishlist is Empty</h2>
          <p>
            Browse our products and add your favorite items to the wishlist!
          </p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h2>My Wishlist</h2>
      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <div key={item.product_id} className="wishlist-item">
            <img
              src={item.image_url || getCategoryImage(item.category)}
              alt={item.name}
              className="product-image"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = getCategoryImage(item.category);
              }}
            />
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="brand">{item.brand}</p>
              <p className="price">${item.price}</p>
              <div className="item-actions">
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(item.product_id)}
                >
                  🛒 Add to Cart
                </button>
                <button
                  className="remove-btn"
                  onClick={() => removeFromWishlist(item.product_id)}
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishList;
