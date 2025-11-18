import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  
  // State for advanced features
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const cartItemCount = cartItems?.length || 0;
  const notifications = [
    { id: 1, message: "Welcome to MERN Shop!", type: "info", time: "5m ago" },
    { id: 2, message: "New products available!", type: "success", time: "1h ago" },
  ];

  return (
    <nav 
      className={`navbar navbar-expand-lg navbar-dark fixed-top py-2 transition-all duration-300 ${
        isScrolled ? 'bg-dark shadow-lg backdrop-blur-md' : 'bg-dark'
      }`}
      style={{ 
        background: isScrolled 
          ? 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))' 
          : 'linear-gradient(135deg, #0d1b2a, #1b263b)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container-fluid px-4">
        {/* Brand */}
        <Link 
          to="/" 
          className="navbar-brand fw-bold d-flex align-items-center"
          style={{ fontSize: '1.5rem' }}
        >
          <div 
            className="me-2 d-flex align-items-center justify-content-center rounded-circle"
            style={{ 
              width: '40px', 
              height: '40px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              animation: 'pulse 2s infinite'
            }}
          >
            <i className="fas fa-shopping-bag text-white"></i>
          </div>
          <span className="text-gradient">MERN Shop</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 p-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Search Bar */}
          <div className="navbar-nav mx-auto">
            <form onSubmit={handleSearch} className="d-flex search-form">
              <div className="input-group" style={{ maxWidth: '500px' }}>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    borderRadius: '25px 0 0 25px',
                    border: '1px solid #495057'
                  }}
                />
                <button 
                  className="btn btn-outline-light" 
                  type="submit"
                  style={{ 
                    borderRadius: '0 25px 25px 0',
                    border: '1px solid #495057'
                  }}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>

          {/* Right Side Navigation */}
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Products Link */}
            <li className="nav-item mx-2">
              <Link 
                to="/products" 
                className="nav-link position-relative"
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="fas fa-th-large me-2"></i>
                Products
              </Link>
            </li>

            {/* Cart with Badge */}
            <li className="nav-item mx-2">
              <Link 
                to="/cart" 
                className="nav-link position-relative"
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                Cart
                {cartItemCount > 0 && (
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ 
                      fontSize: '0.7rem',
                      animation: cartItemCount > 0 ? 'bounce 0.6s' : 'none'
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </li>

            {user ? (
              <>
                {/* Notifications */}
                <li className="nav-item dropdown mx-2" ref={notificationRef}>
                  <button 
                    className="nav-link btn border-0 position-relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <i className="fas fa-bell"></i>
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning rounded-circle">
                      <span className="visually-hidden">New alerts</span>
                    </span>
                  </button>
                  
                  {showNotifications && (
                    <div 
                      className="dropdown-menu dropdown-menu-end show p-0"
                      style={{ 
                        minWidth: '320px',
                        animation: 'fadeIn 0.3s ease'
                      }}
                    >
                      <div className="dropdown-header bg-primary text-white">
                        <i className="fas fa-bell me-2"></i>
                        Notifications
                      </div>
                      {notifications.map((notification) => (
                        <div key={notification.id} className="dropdown-item-text p-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <span className={`badge bg-${notification.type === 'info' ? 'info' : 'success'} mb-1`}>
                                {notification.type}
                              </span>
                              <p className="mb-1 small">{notification.message}</p>
                              <small className="text-muted">{notification.time}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center p-2">
                        <Link to="/notifications" className="btn btn-sm btn-outline-primary">
                          View All
                        </Link>
                      </div>
                    </div>
                  )}
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown mx-2" ref={userMenuRef}>
                  <button 
                    className="nav-link btn border-0 d-flex align-items-center"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div 
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <span className="text-white fw-bold">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="me-1">{user.name || user.email}</span>
                    <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'} small`}></i>
                  </button>
                  
                  {showUserMenu && (
                    <div 
                      className="dropdown-menu dropdown-menu-end show"
                      style={{ 
                        minWidth: '220px',
                        animation: 'fadeIn 0.3s ease'
                      }}
                    >
                      <div className="dropdown-header">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <span className="text-white fw-bold">
                              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="fw-semibold">{user.name || 'User'}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      
                      <Link to="/profile" className="dropdown-item">
                        <i className="fas fa-user me-2"></i>
                        Profile
                      </Link>
                      
                      <Link to="/orders" className="dropdown-item">
                        <i className="fas fa-box me-2"></i>
                        My Orders
                      </Link>
                      
                      {user.role === 'admin' && (
                        <>
                          <div className="dropdown-divider"></div>
                          <h6 className="dropdown-header">Admin Panel</h6>
                          <Link to="/admin/dashboard" className="dropdown-item">
                            <i className="fas fa-tachometer-alt me-2"></i>
                            Dashboard
                          </Link>
                          <Link to="/admin/products" className="dropdown-item">
                            <i className="fas fa-box-open me-2"></i>
                            Manage Products
                          </Link>
                          <Link to="/admin/categories" className="dropdown-item">
                            <i className="fas fa-tags me-2"></i>
                            Manage Categories
                          </Link>
                          <Link to="/admin/orders" className="dropdown-item">
                            <i className="fas fa-file-invoice me-2"></i>
                            Manage Orders
                          </Link>
                          <Link to="/admin/analytics" className="dropdown-item">
                            <i className="fas fa-chart-bar me-2"></i>
                            Analytics
                          </Link>
                        </>
                      )}
                      
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-item text-danger">
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <li className="nav-item mx-2">
                <Link 
                  to="/login" 
                  className="btn btn-outline-light rounded-pill px-4"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
