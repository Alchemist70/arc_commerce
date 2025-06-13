import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage =
    ["/login", "/signup"].includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {!isAuthPage && (
        <>
          <Header />
          <Navbar />
        </>
      )}
      <main className="main-content">{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default AppLayout; 