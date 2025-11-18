import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const AdminNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // State for admin features
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <nav className={`navbar navbar-expand-lg fixed-top transition-all duration-300 ${
      isDarkMode 
        ? (isScrolled ? 'navbar-dark bg-dark shadow-lg' : 'navbar-dark bg-dark')
        : (isScrolled ? 'navbar-light bg-light shadow-lg border-bottom' : 'navbar-light bg-light border-bottom')
    }`} style={{ backdropFilter: isScrolled ? 'blur(10px)' : 'none' }}>
      <div className="container-fluid">
        {/* Admin Brand */}
        <Link className="navbar-brand fw-bold fs-3" to="/admin/dashboard" style={{ letterSpacing: '-1px' }}>
          <i className="fas fa-shield-alt me-2 text-success"></i>
          <span className={isDarkMode ? 'text-white' : 'text-dark'}>Admin</span><span className="text-success">Panel</span>
        </Link>

        {/* Mobile Toggle */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#adminNavbar"
          style={{ boxShadow: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Content */}
        <div className="collapse navbar-collapse" id="adminNavbar">
          {/* Admin Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-medium px-3" to="/admin/dashboard">
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </Link>
            </li>
            
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle fw-medium px-3" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-cogs me-2"></i>
                Management
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/admin/products">
                    <i className="fas fa-box-open me-2"></i>
                    Products
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/categories">
                    <i className="fas fa-tags me-2"></i>
                    Categories
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/orders">
                    <i className="fas fa-file-invoice me-2"></i>
                    Orders
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link fw-medium px-3" to="/admin/analytics">
                <i className="fas fa-chart-bar me-2"></i>
                Analytics
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fw-medium px-3" to="/" target="_blank">
                <i className="fas fa-external-link-alt me-2"></i>
                View Store
              </Link>
            </li>
          </ul>

          {/* Right Side Actions */}
          <ul className="navbar-nav align-items-center">
            {/* Theme Toggle */}
            <li className="nav-item me-3">
              <button 
                className={`btn btn-outline-${isDarkMode ? 'light' : 'dark'} btn-sm`}
                onClick={toggleTheme}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'} me-1`}></i>
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
            </li>

            {/* Quick Stats */}
            <li className="nav-item me-3">
              <span className="navbar-text text-success fw-medium">
                <i className="fas fa-circle text-success me-1" style={{ fontSize: '8px' }}></i>
                System Online
              </span>
            </li>

            {/* Admin Profile Menu */}
            <li className="nav-item dropdown" ref={userMenuRef}>
              <button 
                className="nav-link btn border-0 d-flex align-items-center"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="rounded-circle bg-success text-white me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}>
                  <i className="fas fa-user-shield"></i>
                </div>
                <span className={`fw-medium d-none d-lg-inline ${isDarkMode ? 'text-white' : 'text-dark'}`}>{user?.name}</span>
                <span className="badge bg-warning text-dark ms-2 small">ADMIN</span>
                <i className={`fas fa-chevron-down ms-2 ${isDarkMode ? 'text-white' : 'text-dark'}`} style={{ fontSize: '12px' }}></i>
              </button>

              {/* Admin Dropdown Menu */}
              {showUserMenu && (
                <div className="dropdown-menu dropdown-menu-end show position-absolute" style={{ top: '100%', right: 0, minWidth: '250px' }}>
                  <div className="dropdown-header bg-dark text-white">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-success text-white me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                        <i className="fas fa-user-shield"></i>
                      </div>
                      <div>
                        <div className="fw-medium">{user?.name}</div>
                        <small className="text-muted">{user?.email}</small>
                        <div><span className="badge bg-warning text-dark small">Administrator</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  <h6 className="dropdown-header">Quick Actions</h6>
                  <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-box-open me-2"></i>
                    Manage Products
                  </Link>
                  <Link to="/admin/orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-file-invoice me-2"></i>
                    Manage Orders
                  </Link>
                  <Link to="/admin/analytics" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-chart-bar me-2"></i>
                    View Analytics
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  <h6 className="dropdown-header">Account</h6>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-user-edit me-2"></i>
                    Edit Profile
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;