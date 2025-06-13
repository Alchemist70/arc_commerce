import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            Your trusted destination for quality products and exceptional
            service.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Shop</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <ul>
            <li>
              <i className="fas fa-phone"></i> +1 234 567 8900
            </li>
            <li>
              <i className="fas fa-envelope"></i> info@yourstore.com
            </li>
            <li>
              <i className="fas fa-map-marker-alt"></i> 123 Store Street, City,
              Country
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" aria-label="Pinterest">
              <i className="fab fa-pinterest-p"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 ARS Kart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
