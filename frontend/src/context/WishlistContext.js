import React, { createContext, useState, useEffect } from "react";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };

    fetchWishlistCount();

    // Listen for changes in localStorage
    window.addEventListener("storage", fetchWishlistCount);

    return () => {
      window.removeEventListener("storage", fetchWishlistCount);
    };
  }, []);

  const updateWishlistCount = (count) => {
    setWishlistCount(count);
  };

  return (
    <WishlistContext.Provider value={{ wishlistCount, updateWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};
