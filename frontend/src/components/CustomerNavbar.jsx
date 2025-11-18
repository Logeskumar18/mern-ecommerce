import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { NotificationContext } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";

const CustomerNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { notifications, markAsRead } = useContext(NotificationContext);
  const { isDarkMode, toggleTheme } = useTheme();
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

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  // Get total cart items
  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  // Get unread notifications count
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <nav className={`navbar navbar-expand-lg fixed-top transition-all duration-300 ${
      isDarkMode 
        ? (isScrolled ? 'navbar-dark bg-dark shadow-lg' : 'navbar-dark bg-dark')
        : (isScrolled ? 'navbar-light bg-light shadow-lg border-bottom' : 'navbar-light bg-light border-bottom')
    }`} style={{ backdropFilter: isScrolled ? 'blur(10px)' : 'none' }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-3" to="/" style={{ letterSpacing: '-1px' }}>
          <i className="fas fa-store me-2 text-warning"></i>
          <span className={isDarkMode ? 'text-white' : 'text-dark'}>Shop</span><span className="text-warning">Hub</span>
        </Link>

        {/* Mobile Toggle */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#customerNavbar"
          style={{ boxShadow: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Content */}
        <div className="collapse navbar-collapse" id="customerNavbar">
          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-medium px-3" to="/">
                <i className="fas fa-home me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium px-3" to="/products">
                <i className="fas fa-shopping-bag me-1"></i> Products
              </Link>
            </li>
          </ul>

          {/* Search Bar */}
          <form className="d-flex me-3" onSubmit={handleSearch}>
            <div className="input-group" style={{ minWidth: '250px' }}>
              <input
                className={`form-control border-0 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '14px' }}
              />
              <button className="btn btn-warning" type="submit">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

          {/* Right Side Actions */}
          <ul className="navbar-nav align-items-center">
            {user ? (
              <>
                {/* Theme Toggle */}
                <li className="nav-item me-2">
                  <button 
                    className={`btn btn-outline-${isDarkMode ? 'light' : 'dark'} btn-sm`}
                    onClick={toggleTheme}
                    title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                  >
                    <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                  </button>
                </li>

                {/* Cart Icon */}
                <li className="nav-item me-2">
                  <Link className="nav-link position-relative p-2" to="/cart">
                    <i className="fas fa-shopping-cart fs-5"></i>
                    {cartItemCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                </li>

                {/* Wishlist Icon */}
                <li className="nav-item me-2">
                  <Link className="nav-link position-relative p-2" to="/wishlist" title="My Wishlist">
                    <i className="fas fa-heart fs-5"></i>
                  </Link>
                </li>

                {/* Notifications */}
                <li className="nav-item me-2" ref={notificationRef}>
                  <button 
                    className="nav-link btn border-0 position-relative p-2"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <i className="fas fa-bell fs-5"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="dropdown-menu dropdown-menu-end show position-absolute" style={{ top: '100%', right: 0, width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
                      <div className="dropdown-header d-flex justify-content-between align-items-center">
                        <strong>Notifications</strong>
                        <Link to="/notifications" className="btn btn-sm btn-outline-primary" onClick={() => setShowNotifications(false)}>
                          View All
                        </Link>
                      </div>
                      <div className="dropdown-divider"></div>
                      
                      {notifications?.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div key={notification._id} className={`dropdown-item-text p-3 ${!notification.read ? 'bg-light' : ''}`}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <p className="mb-1 small fw-medium">{notification.title}</p>
                                <p className="mb-1 small text-muted">{notification.message}</p>
                                <small className="text-muted">{new Date(notification.createdAt).toLocaleDateString()}</small>
                              </div>
                              {!notification.read && (
                                <button 
                                  className="btn btn-sm btn-outline-primary ms-2"
                                  onClick={() => markAsRead(notification._id)}
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item-text text-center py-3 text-muted">
                          <i className="fas fa-bell-slash mb-2"></i>
                          <p className="mb-0">No notifications</p>
                        </div>
                      )}
                    </div>
                  )}
                </li>

                {/* User Menu */}
                <li className="nav-item dropdown" ref={userMenuRef}>
                  <button 
                    className="nav-link btn border-0 d-flex align-items-center"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="rounded-circle bg-warning text-dark me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className={`fw-medium d-none d-lg-inline ${isDarkMode ? 'text-white' : 'text-dark'}`}>{user.name}</span>
                    <i className={`fas fa-chevron-down ms-2 ${isDarkMode ? 'text-white' : 'text-dark'}`} style={{ fontSize: '12px' }}></i>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="dropdown-menu dropdown-menu-end show position-absolute" style={{ top: '100%', right: 0, minWidth: '220px' }}>
                      <div className="dropdown-header">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-warning text-dark me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px', fontWeight: 'bold' }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="fw-medium">{user.name}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      
                      <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <i className="fas fa-user me-2"></i>
                        My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <i className="fas fa-shopping-bag me-2"></i>
                        My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <i className="fas fa-heart me-2"></i>
                        My Wishlist
                      </Link>
                      
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
              <>
                {/* Theme Toggle for guests */}
                <li className="nav-item me-2">
                  <button 
                    className={`btn btn-outline-${isDarkMode ? 'light' : 'dark'} btn-sm`}
                    onClick={toggleTheme}
                    title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                  >
                    <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                  </button>
                </li>

                {/* Guest Actions */}
                <li className="nav-item me-2">
                  <Link className="btn btn-outline-warning btn-sm" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm" to="/register">
                    <i className="fas fa-user-plus me-1"></i> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;