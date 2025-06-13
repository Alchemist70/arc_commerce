import React, { useState } from "react";
import "../styles/ProductCard.css";
// Import default category images
import mobileDefault from "../assets/mobile-default.jpg";
import laptopDefault from "../assets/laptop-default.jpg";
import audioDefault from "../assets/audio-default.jpg";
import tvDefault from "../assets/tv-default.jpg";
import tabletDefault from "../assets/tablet-default.jpg";
import defaultImage from "../assets/default-product.jpg";

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getCategoryImage = (category) => {
    const categoryImages = {
      Mobiles: mobileDefault,
      Laptops: laptopDefault,
      Audio: audioDefault,
      "Smart TVs": tvDefault,
      Tablets: tabletDefault,
      default: defaultImage,
    };
    return categoryImages[category] || categoryImages.default;
  };

  const handleImageError = (e) => {
    e.target.src = getCategoryImage(product.category);
  };

  const handleAddToCart = async () => {
    if (isLoadingCart) return;

    setIsLoadingCart(true);
    try {
      await onAddToCart(product);
      setIsInCart(true);
    } catch (error) {
      setIsInCart(false);
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (isLoadingWishlist) return;

    setIsLoadingWishlist(true);
    try {
      await onAddToWishlist(product);
      setIsWishlisted(true);
    } catch (error) {
      setIsWishlisted(false);
      console.error("Error adding to wishlist:", error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  return (
    <div className="product-card">
      <img
        src={product.image_url || getCategoryImage(product.category)}
        alt={product.name}
        onError={handleImageError}
      />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="brand">{product.brand}</p>
        <p className="category">{product.category}</p>
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>
        <div className="product-actions">
          <button
            onClick={handleAddToCart}
            className={`add-to-cart ${isLoadingCart ? "loading" : ""} ${
              isInCart ? "added" : ""
            }`}
            disabled={isLoadingCart}
          >
            {isLoadingCart
              ? "Adding..."
              : isInCart
              ? "Added to Cart"
              : "Add to Cart"}
          </button>
          <button
            onClick={handleAddToWishlist}
            className={`add-to-wishlist ${isLoadingWishlist ? "loading" : ""} ${
              isWishlisted ? "added" : ""
            }`}
            disabled={isLoadingWishlist}
          >
            {isLoadingWishlist
              ? "Adding..."
              : isWishlisted
              ? "Added to Wishlist"
              : "Add to Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
