import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchDashboard = async () => {
      const res = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setData(res.data);
    };
    fetchDashboard();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">Users: {data.totalUsers}</div>
        <div className="bg-green-100 p-4 rounded-lg">Products: {data.totalProducts}</div>
        <div className="bg-yellow-100 p-4 rounded-lg">Orders: {data.totalOrders}</div>
        <div className="bg-red-100 p-4 rounded-lg">Revenue: ₹{data.totalSales}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
