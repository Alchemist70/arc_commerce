import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProductList.css";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      console.log("Adding to cart:", {
        productId: product.id,
        name: product.name,
      });

      const response = await axios.post(
        `${API_URL}/api/cart`,
        {
          productId: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cart API response:", response.data);
      alert("Item added to cart successfully!");
      return response.data;
    } catch (error) {
      console.error("Cart API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        product: product,
      });

      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError();
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to add to cart. Please try again."
        );
      }
      throw error;
    }
  };

  const addToWishlist = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      console.log("Adding to wishlist:", {
        productId: product.id,
        name: product.name,
      });

      const response = await axios.post(
        `${API_URL}/api/wishlist`,
        {
          productId: product.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Wishlist API response:", response.data);
      alert("Item added to wishlist successfully!");
      return response.data;
    } catch (error) {
      console.error("Wishlist API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        product: product,
      });

      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError();
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to add to wishlist. Please try again."
        );
      }
      throw error;
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
