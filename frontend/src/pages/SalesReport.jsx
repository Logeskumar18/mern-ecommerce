import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const SalesReport = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const res = await axios.get("/api/analytics/daily-sales", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSales(res.data);
    };
    fetchSales();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Daily Sales Report</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sales}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalSales" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesReport;
