import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  RefreshCw, 
  TrendingUp, 
  PackageCheck, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Calendar,
  Clock,
  Eye
} from "lucide-react";

const Analytics = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const token = localStorage.getItem("token");

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes, productsRes, categoryRes, monthlyRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/daily-sales`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/top-products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/category-sales`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/monthly-revenue`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setDashboardStats(statsData);
      }
      
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setDailySales(salesData);
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setTopProducts(productsData);
      }
      
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        setCategorySales(categoryData);
      }
      
      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        setMonthlyRevenue(monthlyData);
      }

      setMessage("");
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setMessage("❌ Server error while fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#EC4899'];

  // KPI Card Component
  const KPICard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted mb-1 small">{title}</p>
            <h3 className="fw-bold mb-0">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className={`rounded-circle p-3 ${color}`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-2">
            <small className={`badge ${trend > 0 ? 'bg-success' : 'bg-danger'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </small>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold mb-0">
            <TrendingUp className="me-3 text-primary" size={32} />
            Analytics Dashboard
          </h1>
          <p className="text-muted mb-0">Real-time insights and business metrics</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinner-border spinner-border-sm' : ''} /> 
            Refresh
          </button>
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
              <Calendar size={16} className="me-2" />
              Export
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Export PDF</a></li>
              <li><a className="dropdown-item" href="#">Export CSV</a></li>
              <li><a className="dropdown-item" href="#">Export Excel</a></li>
            </ul>
          </div>
        </div>
      </div>

      {message && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          {dashboardStats && (
            <div className="row g-4 mb-4">
              <div className="col-xl-3 col-md-6">
                <KPICard
                  title="Total Revenue"
                  value={`₹${dashboardStats.totals.revenue.toLocaleString()}`}
                  icon={DollarSign}
                  color="bg-success"
                  subtitle="All time revenue"
                />
              </div>
              <div className="col-xl-3 col-md-6">
                <KPICard
                  title="Total Orders"
                  value={dashboardStats.totals.orders}
                  icon={ShoppingCart}
                  color="bg-primary"
                  subtitle="All time orders"
                />
              </div>
              <div className="col-xl-3 col-md-6">
                <KPICard
                  title="Active Customers"
                  value={dashboardStats.totals.users}
                  icon={Users}
                  color="bg-info"
                  subtitle="Registered customers"
                />
              </div>
              <div className="col-xl-3 col-md-6">
                <KPICard
                  title="Total Products"
                  value={dashboardStats.totals.products}
                  icon={Package}
                  color="bg-warning"
                  subtitle="In catalog"
                />
              </div>
            </div>
          )}

          {/* Time Period Stats */}
          {dashboardStats && (
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <Clock className="text-primary mb-2" size={32} />
                    <h5 className="fw-bold">Today</h5>
                    <div className="row">
                      <div className="col-6">
                        <h4 className="text-success mb-0">₹{dashboardStats.today.revenue.toLocaleString()}</h4>
                        <small className="text-muted">Revenue</small>
                      </div>
                      <div className="col-6">
                        <h4 className="text-primary mb-0">{dashboardStats.today.orders}</h4>
                        <small className="text-muted">Orders</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <Calendar className="text-info mb-2" size={32} />
                    <h5 className="fw-bold">This Week</h5>
                    <div className="row">
                      <div className="col-6">
                        <h4 className="text-success mb-0">₹{dashboardStats.weekly.revenue.toLocaleString()}</h4>
                        <small className="text-muted">Revenue</small>
                      </div>
                      <div className="col-6">
                        <h4 className="text-primary mb-0">{dashboardStats.weekly.orders}</h4>
                        <small className="text-muted">Orders</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <TrendingUp className="text-warning mb-2" size={32} />
                    <h5 className="fw-bold">This Month</h5>
                    <div className="row">
                      <div className="col-6">
                        <h4 className="text-success mb-0">₹{dashboardStats.monthly.revenue.toLocaleString()}</h4>
                        <small className="text-muted">Revenue</small>
                      </div>
                      <div className="col-6">
                        <h4 className="text-primary mb-0">{dashboardStats.monthly.orders}</h4>
                        <small className="text-muted">Orders</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="row g-4 mb-4">
            {/* Daily Sales Trend */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title d-flex align-items-center gap-2 mb-0">
                    <TrendingUp className="text-success" size={20} />
                    Daily Sales Trend (Last 30 Days)
                  </h5>
                </div>
                <div className="card-body">
                  {dailySales.length === 0 ? (
                    <div className="text-center py-5">
                      <Eye className="text-muted mb-2" size={48} />
                      <p className="text-muted">No sales data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={dailySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'totalSales' ? `₹${value.toLocaleString()}` : value,
                            name === 'totalSales' ? 'Revenue' : name === 'orders' ? 'Orders' : name
                          ]}
                          labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="totalSales"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.1}
                          strokeWidth={3}
                        />
                        <Area
                          type="monotone"
                          dataKey="orders"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title d-flex align-items-center gap-2 mb-0">
                    <PackageCheck className="text-info" size={20} />
                    Order Status
                  </h5>
                </div>
                <div className="card-body">
                  {dashboardStats?.orderStatusDistribution?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboardStats.orderStatusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="_id"
                        >
                          {dashboardStats.orderStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-5">
                      <Eye className="text-muted mb-2" size={48} />
                      <p className="text-muted">No order data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products and Categories */}
          <div className="row g-4 mb-4">
            {/* Top Products */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title d-flex align-items-center gap-2 mb-0">
                    <Package className="text-warning" size={20} />
                    Top Selling Products
                  </h5>
                </div>
                <div className="card-body">
                  {topProducts.length === 0 ? (
                    <div className="text-center py-5">
                      <Package className="text-muted mb-2" size={48} />
                      <p className="text-muted">No product data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={topProducts} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" stroke="#6b7280" fontSize={12} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={120} 
                          stroke="#6b7280" 
                          fontSize={11}
                          tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'totalSold' ? `${value} units` : `₹${value.toLocaleString()}`,
                            name === 'totalSold' ? 'Units Sold' : 'Revenue'
                          ]}
                        />
                        <Bar dataKey="totalSold" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Category Sales */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title d-flex align-items-center gap-2 mb-0">
                    <PackageCheck className="text-purple" size={20} />
                    Sales by Category
                  </h5>
                </div>
                <div className="card-body">
                  {categorySales.length === 0 ? (
                    <div className="text-center py-5">
                      <PackageCheck className="text-muted mb-2" size={48} />
                      <p className="text-muted">No category data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={categorySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280" 
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'totalSales' ? `₹${value.toLocaleString()}` : `${value} items`,
                            name === 'totalSales' ? 'Revenue' : 'Items Sold'
                          ]}
                        />
                        <Bar dataKey="totalSales" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          {monthlyRevenue.length > 0 && (
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0 pb-0">
                    <h5 className="card-title d-flex align-items-center gap-2 mb-0">
                      <Calendar className="text-primary" size={20} />
                      Monthly Revenue Trend
                    </h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                            name === 'revenue' ? 'Revenue' : 'Orders'
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {dashboardStats?.recentOrders?.length > 0 && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0 pb-0">
                    <h5 className="card-title d-flex align-items-center gap-2 mb-0">
                      <Clock className="text-info" size={20} />
                      Recent Orders
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Items</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardStats.recentOrders.map((order, index) => (
                            <tr key={index}>
                              <td>
                                <div>
                                  <strong>{order.user?.name || 'N/A'}</strong>
                                  <br />
                                  <small className="text-muted">{order.user?.email}</small>
                                </div>
                              </td>
                              <td>
                                <strong className="text-primary">₹{order.totalAmount.toLocaleString()}</strong>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {order.items?.length || 0} items
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  order.orderStatus === 'delivered' ? 'bg-success' :
                                  order.orderStatus === 'pending' ? 'bg-warning' :
                                  order.orderStatus === 'shipped' ? 'bg-info' :
                                  'bg-secondary'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
