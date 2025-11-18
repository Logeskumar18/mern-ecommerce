import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { 
  BarChart3, Truck, Users, Package, RefreshCw, ShoppingCart, 
  Settings, Tag, FileText, TrendingUp, TrendingDown, 
  DollarSign, Eye, Calendar, Target 
} from "lucide-react";

const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || data); // Handle both new and old API responses
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      setError("Server error while loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className={`min-vh-100 d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className={isDarkMode ? 'text-light' : 'text-muted'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-vh-100 d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="alert alert-danger d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Admin Dashboard</h1>
            <p className="text-muted mb-0">Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={fetchDashboard}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-primary bg-gradient rounded-3 p-3">
                      <Users className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted small mb-1">Total Users</h6>
                    <h4 className="mb-1">{stats?.totalUsers?.toLocaleString() || 0}</h4>
                    {stats?.userGrowthRate && (
                      <div className={`small d-flex align-items-center ${stats.userGrowthRate >= 0 ? 'text-success' : 'text-danger'}`}>
                        {stats.userGrowthRate >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="ms-1">{Math.abs(stats.userGrowthRate)}% this month</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-success bg-gradient rounded-3 p-3">
                      <ShoppingCart className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted small mb-1">Total Orders</h6>
                    <h4 className="mb-1">{stats?.totalOrders?.toLocaleString() || 0}</h4>
                    {stats?.orderGrowthRate && (
                      <div className={`small d-flex align-items-center ${stats.orderGrowthRate >= 0 ? 'text-success' : 'text-danger'}`}>
                        {stats.orderGrowthRate >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="ms-1">{Math.abs(stats.orderGrowthRate)}% this month</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-info bg-gradient rounded-3 p-3">
                      <Package className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted small mb-1">Total Products</h6>
                    <h4 className="mb-1">{stats?.totalProducts?.toLocaleString() || 0}</h4>
                    <div className="small text-muted">
                      <span>{stats?.totalCategories || 0} categories</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-warning bg-gradient rounded-3 p-3">
                      <DollarSign className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted small mb-1">Total Revenue</h6>
                    <h4 className="mb-1">{formatCurrency(stats?.totalRevenue || stats?.totalSales || 0)}</h4>
                    <div className="small text-muted">
                      <span>From completed orders</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Quick Actions */}
          <div className="col-xl-4">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-header">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Settings size={20} />
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link to="/admin/products" className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2">
                    <Package size={16} />
                    Manage Products
                  </Link>
                  <Link to="/admin/categories" className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2">
                    <Tag size={16} />
                    Manage Categories
                  </Link>
                  <Link to="/admin/orders" className="btn btn-outline-info d-flex align-items-center justify-content-center gap-2">
                    <Truck size={16} />
                    View All Orders
                  </Link>
                  <div className="btn btn-outline-warning d-flex align-items-center justify-content-center gap-2" onClick={() => alert('User Management: Coming Soon!')}>
                    <Users size={16} />
                    Manage Users
                  </div>
                  <Link to="/admin/analytics" className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2">
                    <BarChart3 size={16} />
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="col-xl-8">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <FileText size={20} />
                  Recent Orders
                </h5>
                <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {stats?.recentOrders?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <code>#{order._id.slice(-6)}</code>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{order.user?.name}</div>
                                <small className="text-muted">{order.user?.email}</small>
                              </div>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td className="fw-medium">{formatCurrency(order.total || order.totalAmount)}</td>
                            <td>
                              <span className={`badge bg-${getStatusColor(order.status || order.orderStatus)}`}>
                                {(order.status || order.orderStatus)?.charAt(0)?.toUpperCase() + (order.status || order.orderStatus)?.slice(1)}
                              </span>
                            </td>
                            <td>
                              <Link 
                                to={`/admin/orders`}
                                className="btn btn-sm btn-outline-primary"
                                title="View Order Details"
                              >
                                <Eye size={14} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText size={48} className="text-muted mb-3" />
                    <p className="text-muted">No recent orders found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        {stats?.orderStats?.length > 0 && (
          <div className="row g-4 mt-2">
            <div className="col-12">
              <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-header">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <Target size={20} />
                    Order Status Distribution
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {stats.orderStats.map((statusData) => (
                      <div key={statusData._id} className="col-md-6 col-lg-3">
                        <div className={`p-3 rounded ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">{statusData._id?.charAt(0)?.toUpperCase() + statusData._id?.slice(1)}</h6>
                              <h4 className="mb-0">{statusData.count}</h4>
                            </div>
                            <div className={`badge bg-${getStatusColor(statusData._id)} fs-6`}>
                              {((statusData.count / stats.totalOrders) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
