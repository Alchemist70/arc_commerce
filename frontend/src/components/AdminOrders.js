import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder-image.svg";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      console.log("Auth state:", {
        token: token ? "Present" : "Missing",
        user: user ? "Present" : "Missing",
        isAdmin: user?.isAdmin,
      });

      if (!token || !user) {
        console.log("No token or user found, redirecting to login");
        navigate("/login");
        return;
      }

      if (!user.isAdmin) {
        console.log("User is not an admin");
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: function (status) {
          return status < 500;
        },
      });

      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });

      if (response.status === 401) {
        console.log("Unauthorized access, clearing auth state");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      if (!response.data) {
        console.error("Empty response received");
        setError("No data received from server");
        setLoading(false);
        return;
      }

      if (!Array.isArray(response.data)) {
        console.error("Invalid response format:", response.data);
        setError("Invalid data format received from server");
        setLoading(false);
        return;
      }

      // Process the orders to ensure image URLs are complete
      const processedOrders = response.data.map((order) => ({
        ...order,
        items: (order.items || []).map((item) => ({
          ...item,
          image_url: getImageUrl(item.image_url),
        })),
      }));

      setOrders(processedOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        config: error.config,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to fetch orders. Please try again later."
      );
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Status update response:", response.data);
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error("Error updating order status:", error.response || error);
      alert(
        error.response?.data?.message ||
          "Failed to update order status. Please try again."
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!orders.length) return <div className="no-orders">No orders found</div>;

  return (
    <div className="admin-orders">
      <h2>Order Management</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.order_id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.order_id}</h3>
                <p>Date: {formatDate(order.order_date)}</p>
                <p>
                  Customer: {order.first_name} {order.last_name}
                </p>
                <p>Email: {order.user_email}</p>
              </div>
              <div className="order-status">
                <select
                  value={order.status || "pending"}
                  onChange={(e) =>
                    handleStatusUpdate(order.order_id, e.target.value)
                  }
                  className={`status-${(
                    order.status || "pending"
                  ).toLowerCase()}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="order-details">
              <div className="shipping-info">
                <h4>Shipping Address</h4>
                <p>
                  {order.shipping_address || "No shipping address provided"}
                </p>
              </div>
              <div className="payment-info">
                <h4>Payment Status</h4>
                <p
                  className={`payment-status-${(
                    order.payment_status || "pending"
                  ).toLowerCase()}`}
                >
                  {order.payment_status || "Pending"}
                </p>
              </div>
            </div>
            <div className="order-items">
              <h4>Items</h4>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="product-info">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-image.svg";
                          }}
                        />
                        <span>{item.product_name}</span>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.unit_price)}</td>
                      <td>{formatPrice(item.quantity * item.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="order-total">
              <h4>Total Amount: {formatPrice(order.total_amount)}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
