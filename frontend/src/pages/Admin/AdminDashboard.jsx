import React, { useEffect, useState } from "react";
import { BarChart3, Truck, Users, Package, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setStats(data);
    } catch {
      setMessage("Failed to load dashboard data");
    }
  };

  // Fetch All Orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch {
      setMessage("Failed to load orders");
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchDashboard(), fetchOrders()]);
      setLoading(false);
    })();
  }, []);

  // Update Order Status
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMessage("✅ Order status updated!");
        fetchOrders(); // refresh list
      } else {
        setMessage("❌ Failed to update status");
      }
    } catch {
      setMessage("❌ Server error while updating order");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center text-secondary" style={{ minHeight: "100vh" }}>
        Loading dashboard...
      </div>
    );

  return (
    <div className="bg-light p-4 p-md-5" style={{ minHeight: "100vh" }}>
      <div className="container">
        <h1 className="text-center mb-5 fw-bold text-dark">Admin Dashboard</h1>

        {message && (
          <div className="text-center text-success mb-4 small fw-medium">
            {message}
          </div>
        )}

        {/* --- Overview Stats --- */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard icon={<Package />} label="Products" value={stats?.totalProducts} />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard icon={<Truck />} label="Orders" value={stats?.totalOrders} />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard icon={<Users />} label="Users" value={stats?.totalUsers} />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard icon={<BarChart3 />} label="Revenue" value={`₹${stats?.totalRevenue}`} />
          </div>
        </div>

        {/* --- Orders Table --- */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-semibold">All Orders</h2>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="text-truncate" style={{ maxWidth: "120px" }}>{order._id}</td>
                      <td>{order.userId?.name || "N/A"}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="fw-semibold text-primary">₹{order.totalAmount}</td>
                      <td className={order.status === "Delivered" ? "text-success fw-semibold" : "text-warning fw-semibold"}>
                        {order.status}
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="form-select form-select-sm"
                        >
                          <option>Pending</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
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
  );
};

// Reusable stat card
const StatCard = ({ icon, label, value }) => (
  <div className="card shadow-sm p-3 d-flex align-items-center gap-3">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-secondary small mb-1">{label}</p>
      <h3 className="h5 fw-bold mb-0">{value}</h3>
    </div>
  </div>
);

export default AdminDashboard;
