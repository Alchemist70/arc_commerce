import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProductList from "./components/ProductList";
import AdminPanel from "./components/AdminPanel";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Products from "./pages/Products";
import WishListPage from "./pages/WishList";
import CartPage from "./pages/Cart";
import SubCategoryPage from "./pages/SubCategoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import UserManagement from "./components/UserManagement";
import ProductManagement from "./components/ProductManagement";
import AdminOrders from "./components/AdminOrders";
import Checkout from "./components/Checkout";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import PaymentPortal from "./components/PaymentPortal";
import PrivateRoute from "./components/PrivateRoute";
import UserProfile from "./pages/UserProfile";
import PaymentOptions from "./pages/PaymentOptions";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderSummary from "./components/OrderSummary";
import Payment from "./pages/Payment";
import AppLayout from "./components/AppLayout";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User state updated:", {
          isAdmin: parsedUser?.isAdmin,
          hasToken: !!localStorage.getItem("token"),
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  return (
    <CartProvider>
      <WishlistProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category/:category" element={<ProductList />} />
            <Route
              path="/category/:category/:subcategory"
              element={<SubCategoryPage />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <CartPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />

            <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />

            <Route path="/payment-options" element={<PrivateRoute><PaymentOptions /></PrivateRoute>} />
            <Route path="/order-confirmation" element={<PrivateRoute><OrderConfirmation /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/products" replace />}
              />
              <Route path="products" element={<ProductManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="categories" element={<ProductManagement />} />
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;
