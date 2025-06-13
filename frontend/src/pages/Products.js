import React from "react";
import ProductList from "../components/ProductList";
import "../styles/Products.css";

const Products = () => {
  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Discover our wide range of electronics and accessories</p>
      </div>
      <ProductList />
    </div>
  );
};

export default Products;
