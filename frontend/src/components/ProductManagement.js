import React, { useState, useEffect } from "react";
import "../styles/ProductManagement.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    description: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching products with token:", token);

      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Products received:", data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateImageUrl = async (url) => {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted", formData);

    try {
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      const result = await response.json();
      console.log("Product added:", result);

      setShowForm(false);
      setFormData({
        name: "",
        brand: "",
        category: "",
        price: "",
        description: "",
        image_url: "",
      });
      fetchProducts();
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchProducts();
      }
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  if (!localStorage.getItem("token")) {
    return <div>Please log in to access this page</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="product-management">
      <div className="product-header">
        <h2>Products Management</h2>
        <button
          className="add-product-btn"
          onClick={() => {
            console.log("Opening form...");
            setShowForm(true);
          }}
          style={{
            backgroundColor: "#1565c0",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "block", // Ensure button is visible
            margin: "20px 0", // Add some margin
          }}
        >
          + Add New Product
        </button>
      </div>

      {console.log("Current showForm value:", showForm)}

      {showForm && (
        <div className="form-overlay">
          <div className="product-form">
            <h3>Add New Product</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-list">
        {products.length === 0 ? (
          <p className="no-products">
            No products found. Add your first product!
          </p>
        ) : (
          products.map((product, index) => (
            <div key={product.id || index} className="product-card">
              <img
                src={
                  product.image_url ||
                  "https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?auto=format&fit=crop&w=800&q=80"
                }
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="brand">{product.brand}</p>
                <p className="category">{product.category}</p>
                <p className="price">${parseFloat(product.price).toFixed(2)}</p>
                <p className="description">{product.description}</p>
              </div>
              <div className="product-actions">
                <button
                  onClick={() => handleDelete(product.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
