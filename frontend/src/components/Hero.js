import React from "react";
import { Link } from "react-router-dom";
import "../styles/Hero.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faTag,
  faTruck,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

const Hero = () => {
  return (
    <div className="hero-wrapper">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover the Future of Electronics</h1>
          <p>
            Experience cutting-edge technology with exclusive deals on the
            latest gadgets and electronics.
          </p>

          <div className="hero-features">
            <div className="feature">
              <FontAwesomeIcon icon={faTag} />
              <span>Best Prices</span>
            </div>
            <div className="feature">
              <FontAwesomeIcon icon={faTruck} />
              <span>Fast Delivery</span>
            </div>
            <div className="feature">
              <FontAwesomeIcon icon={faHeadset} />
              <span>24/7 Support</span>
            </div>
          </div>

          <div className="hero-cta">
            <Link to="/products" className="shop-now-btn">
              Shop Now <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=2342&auto=format&fit=crop"
            alt="Latest electronics and gadgets"
          />
        </div>
      </section>

      <div className="featured-categories">
        <h2>Popular Categories</h2>
        <div className="category-grid">
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2340&auto=format&fit=crop"
              alt="Smartphones"
            />
            <h3>Smartphones</h3>
            <p>Latest models from top brands</p>
          </div>
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2340&auto=format&fit=crop"
              alt="Laptops"
            />
            <h3>Laptops</h3>
            <p>Powerful computing solutions</p>
          </div>
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1625873673898-ae60832c2927?q=80&w=2340&auto=format&fit=crop"
              alt="Accessories"
            />
            <h3>Accessories</h3>
            <p>Essential add-ons for your devices</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
