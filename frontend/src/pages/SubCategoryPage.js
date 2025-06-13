import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import "../styles/SubCategoryPage.css";

const SubCategoryPage = () => {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products for the specific subcategory
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/products/${category}/${subcategory}`
        );
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  const handleAddToWishlist = async (product) => {
    try {
      const userId = localStorage.getItem("userId"); // Assuming you store userId in localStorage
      await axios.post("http://localhost:5001/api/wishlist", {
        userId,
        productId: product.id,
      });
      alert("Added to wishlist!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Failed to add to wishlist");
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.post("http://localhost:5001/api/cart", {
        userId,
        productId: product.id,
        quantity: 1,
      });
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="subcategory-page">
      <div className="subcategory-header">
        <h1>{subcategory}</h1>
        <p>
          Explore our collection of {subcategory} in {category}
        </p>
      </div>

      <div className="filters-section">
        <select className="sort-select" defaultValue="">
          <option value="" disabled>
            Sort By
          </option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToWishlist={handleAddToWishlist}
              onAddToCart={handleAddToCart}
            />
          ))
        ) : (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategoryPage;
