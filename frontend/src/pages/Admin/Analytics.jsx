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
} from "recharts";
import { RefreshCw, TrendingUp, PackageCheck } from "lucide-react";

const Analytics = () => {
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetch("/api/analytics/daily-sales", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/analytics/top-products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const salesData = await salesRes.json();
      const productsData = await productsRes.json();

      if (salesRes.ok && productsRes.ok) {
        setDailySales(salesData);
        setTopProducts(productsData);
        setMessage("");
      } else {
        setMessage("⚠️ Failed to load analytics data");
      }
    } catch {
      setMessage("❌ Server error while fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="d-flex align-items-center gap-2">
          <TrendingUp className="text-primary" size={28} />
          Analytics Dashboard
        </h1>
        <button
          className="btn btn-outline-primary d-flex align-items-center gap-1"
          onClick={fetchAnalytics}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message && (
        <div className="alert alert-danger text-center">{message}</div>
      )}

      {loading ? (
        <p className="text-center text-muted">Loading analytics...</p>
      ) : (
        <div className="row g-4">
          {/* Daily Sales Chart */}
          <div className="col-md-6">
            <div className="card shadow-sm p-3 h-100">
              <h5 className="card-title d-flex align-items-center gap-2 mb-3">
                <TrendingUp className="text-success" size={20} />
                Daily Sales
              </h5>
              {dailySales.length === 0 ? (
                <p className="text-center text-muted py-5">
                  No sales data available.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="col-md-6">
            <div className="card shadow-sm p-3 h-100">
              <h5 className="card-title d-flex align-items-center gap-2 mb-3">
                <PackageCheck className="text-warning" size={20} />
                Top Products
              </h5>
              {topProducts.length === 0 ? (
                <p className="text-center text-muted py-5">
                  No top product data available.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSold" fill="#10b981" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
