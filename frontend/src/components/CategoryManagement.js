import React, { useState, useEffect } from "react";
import "../styles/ProductManagement.css";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to add category");
      setShowForm(false);
      setFormData({ name: "", description: "" });
      fetchCategories();
      alert("Category added successfully!");
    } catch (error) {
      alert("Failed to add category. Please try again.");
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
        <h2>Categories Management</h2>
        <button
          className="add-product-btn"
          onClick={() => setShowForm(true)}
          style={{
            backgroundColor: "#1565c0",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "block",
            margin: "20px 0",
          }}
        >
          + Add New Category
        </button>
      </div>
      {showForm && (
        <div className="form-overlay">
          <div className="product-form">
            <h3>Add New Category</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
              <div className="form-buttons">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="products-list">
        {categories.length === 0 ? (
          <p className="no-products">No categories found. Add your first category!</p>
        ) : (
          categories.map((cat, idx) => (
            <div key={cat.id || idx} className="product-card">
              <div className="product-details">
                <h3>{cat.name}</h3>
                <p className="description">{cat.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryManagement; 