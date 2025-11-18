import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // Initialize form with user data
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    // Fetch user orders
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setEditMode(false);
        // Update the form with the returned data
        if (data.user) {
          setForm({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            address: data.user.address || "",
          });
        }
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Something went wrong while updating profile");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3 className="text-danger mb-3">Access Denied</h3>
          <p className="text-muted mb-4">Please log in to view your profile</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "2rem" }}>
      <div className="container py-4">
        {/* Profile Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <span className="text-white fw-bold fs-4">
                        {getInitials(user.name || user.email)}
                      </span>
                    </div>
                    <div>
                      <h1 className="h3 fw-bold mb-1">{user.name || "User"}</h1>
                      <p className="text-muted mb-1">{user.email}</p>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <Link to="/" className="btn btn-outline-primary">
                      <i className="fas fa-home me-2"></i>
                      Home
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline-danger">
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Profile Information */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-user me-2 text-primary"></i>
                  Profile Information
                </h5>
                {!editMode && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit
                  </button>
                )}
              </div>
              
              <div className="card-body">
                {message && (
                  <div className="alert alert-success alert-dismissible">
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger alert-dismissible">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                  </div>
                )}

                {editMode ? (
                  <form onSubmit={handleUpdate}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter your email"
                          disabled
                        />
                        <small className="text-muted">Email cannot be changed</small>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label fw-semibold">Address</label>
                        <textarea
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          className="form-control"
                          rows="3"
                          placeholder="Enter your address"
                        />
                      </div>
                      
                      <div className="col-12 d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditMode(false);
                            setForm({
                              name: user.name || "",
                              email: user.email || "",
                              phone: user.phone || "",
                              address: user.address || "",
                            });
                            setError("");
                            setMessage("");
                          }}
                        >
                          <i className="fas fa-times me-1"></i>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-save me-1"></i>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <label className="small text-muted mb-1">Full Name</label>
                        <span className="fw-semibold">{form.name || "Not provided"}</span>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <label className="small text-muted mb-1">Email Address</label>
                        <span className="fw-semibold">{form.email}</span>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <label className="small text-muted mb-1">Phone Number</label>
                        <span className="fw-semibold">{form.phone || "Not provided"}</span>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <label className="small text-muted mb-1">Account Type</label>
                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'} w-fit`}>
                          {user.role === 'admin' ? 'Administrator' : 'Customer'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex flex-column">
                        <label className="small text-muted mb-1">Address</label>
                        <span className="fw-semibold">{form.address || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-chart-line me-2 text-success"></i>
                  Account Stats
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Total Orders</span>
                  <span className="fw-bold fs-5 text-primary">{orders.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Account Type</span>
                  <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Member Since</span>
                  <span className="fw-semibold small">
                    {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-bolt me-2 text-warning"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link to="/orders" className="btn btn-outline-primary">
                    <i className="fas fa-box me-2"></i>
                    View All Orders
                  </Link>
                  <Link to="/products" className="btn btn-outline-success">
                    <i className="fas fa-shopping-bag me-2"></i>
                    Continue Shopping
                  </Link>
                  <Link to="/cart" className="btn btn-outline-info">
                    <i className="fas fa-shopping-cart me-2"></i>
                    View Cart
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="btn btn-outline-danger">
                      <i className="fas fa-tachometer-alt me-2"></i>
                      Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-clock me-2 text-info"></i>
                  Recent Orders
                </h5>
                <Link to="/orders" className="btn btn-outline-primary btn-sm">
                  View All Orders
                </Link>
              </div>
              
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-box-open text-muted mb-3" style={{ fontSize: "3rem" }}></i>
                    <h6 className="text-muted">No orders yet</h6>
                    <p className="text-muted small mb-4">Start shopping to see your orders here</p>
                    <Link to="/products" className="btn btn-primary">
                      <i className="fas fa-shopping-bag me-2"></i>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order._id}>
                            <td>
                              <span className="font-monospace small">
                                #{order._id?.slice(-6).toUpperCase()}
                              </span>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                              <span className={`badge ${
                                order.status === "Delivered" ? "bg-success" :
                                order.status === "Processing" ? "bg-warning" :
                                order.status === "Shipped" ? "bg-info" : "bg-secondary"
                              }`}>
                                {order.status || "Pending"}
                              </span>
                            </td>
                            <td className="fw-semibold text-primary">
                              ₹{order.totalAmount || 0}
                            </td>
                            <td>
                              <Link 
                                to={`/orders/${order._id}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
