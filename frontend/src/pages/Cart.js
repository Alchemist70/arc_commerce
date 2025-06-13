import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Cart.css";
import "../styles/common.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Cart from "../components/Cart";

const CartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <button 
        className="back-button" 
        onClick={() => navigate("/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to Shop
      </button>
      <Cart />
    </div>
  );
};

export default CartPage;
