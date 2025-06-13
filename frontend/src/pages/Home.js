import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <Header />
      <Navbar />
      <Hero />
    </div>
  );
};

export default Home;
