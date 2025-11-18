
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SmartNavbar from "./components/SmartNavbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";

// // 🔹 User Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterAdmin from "./pages/RegisterAdmin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTPLogin from "./pages/OTPLogin";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

// // 🔹 Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageProducts from "./pages/Admin/ManageProducts";
import ManageCategories from "./pages/Admin/ManageCategories";
import ManageOrders from "./pages/Admin/ManageOrders";
import Analytics from "./pages/Admin/Analytics";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Smart Header - Shows Admin or Customer Navbar based on user role */}
        <SmartNavbar />

      {/* Page Routes */}
      <Routes>
        {/* 🧍‍♂️ Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-customer" element={<RegisterCustomer />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-login" element={<OTPLogin />} />

        {/* 🏠 User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* 🧑‍💼 Admin Routes - Protected */}
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/products" element={<AdminProtectedRoute><ManageProducts /></AdminProtectedRoute>} />
        <Route path="/admin/categories" element={<AdminProtectedRoute><ManageCategories /></AdminProtectedRoute>} />
        <Route path="/admin/orders" element={<AdminProtectedRoute><ManageOrders /></AdminProtectedRoute>} />
        <Route path="/admin/analytics" element={<AdminProtectedRoute><Analytics /></AdminProtectedRoute>} />

        {/* ❌ 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

        {/* Common Footer */}
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
