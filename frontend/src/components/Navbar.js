import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

// Import images correctly
import mobileImg from "../assets/mobile.jpg";
import laptopImg from "../assets/laptop.jpg";
import audioImg from "../assets/audio.jpg";
import smartTvImg from "../assets/smart_tv.jpg";
import tabletImg from "../assets/tablet.jpg";
import gamingImg from "../assets/gaming.jpg";
import camerasImg from "../assets/cameras.jpg";

const categories = [
  {
    name: "Mobiles",
    img: mobileImg,
    subCategories: ["Latest Phones", "Budget Phones", "Premium Phones"],
  },
  {
    name: "Laptops",
    img: laptopImg,
    subCategories: ["Gaming Laptops", "Business Laptops", "Student Laptops"],
  },
  {
    name: "Audio",
    img: audioImg,
    subCategories: ["Headphones", "Speakers", "Earbuds"],
  },
  {
    name: "Smart TVs",
    img: smartTvImg,
    subCategories: ["4K TVs", "OLED TVs", "Smart Android TVs"],
  },
  {
    name: "Tablets",
    img: tabletImg,
    subCategories: ["iPads", "Android Tablets", "Drawing Tablets"],
  },
  {
    name: "Gaming",
    img: gamingImg,
    subCategories: [
      "Gaming Consoles",
      "Gaming Accessories",
      "Gaming Components",
    ],
  },
  {
    name: "Cameras",
    img: camerasImg,
    subCategories: ["DSLR Cameras", "Action Cameras", "Security Cameras"],
  },
];

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="category-list">
          {categories.map((category, index) => (
            <li className="category-item" key={index}>
              <Link
                to={`/category/${category.name.toLowerCase()}`}
                className="category-link"
              >
                <img
                  src={category.img}
                  alt={category.name}
                  className="category-icon"
                />
                <span className="category-name">{category.name}</span>
              </Link>
              <ul className="dropdown-menu">
                {category.subCategories.map((sub, i) => (
                  <li key={i}>
                    <Link
                      to={`/category/${category.name.toLowerCase()}/${sub
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="dropdown-item"
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
