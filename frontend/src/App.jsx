
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// // 🔹 User Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerify from "./pages/OTPVerify";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// // 🔹 Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageProducts from "./pages/Admin/ManageProducts";
import ManageCategories from "./pages/Admin/ManageCategories";
import Analytics from "./pages/Admin/Analytics";

function App() {
  return (
    <Router>
      {/* Common Header */}
      <Navbar />

      {/* Page Routes */}
      <Routes>
        {/* 🧍‍♂️ Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerify />} />

        {/* 🏠 User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/profile" element={<Profile />} />

        {/* 🧑‍💼 Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* ❌ 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Common Footer */}
      <Footer />
    </Router>
  );
}

export default App;
