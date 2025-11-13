import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;

      try {
        const res = await fetch(`/api/orders/user/${user._id}`);
        const data = await res.json();

        if (res.ok) setOrders(data);
        else setError("Failed to fetch orders");
      } catch (err) {
        setError("Something went wrong while fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center text-secondary" style={{ minHeight: "100vh" }}>
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center text-danger fw-semibold" style={{ minHeight: "100vh" }}>
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center bg-light" style={{ minHeight: "100vh", padding: "1rem" }}>
        <h2 className="h4 fw-semibold text-secondary mb-3">
          You haven’t placed any orders yet 📦
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-light py-5 px-3" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="bg-white shadow rounded-3 p-4 p-md-5">
          <h2 className="h3 fw-bold mb-5 text-center text-dark">
            Your Orders
          </h2>

          <div className="d-flex flex-column gap-4">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-3 p-3 p-md-4 bg-light transition-shadow" style={{ transition: "box-shadow 0.2s" }}>
                
                {/* Order Info */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                  <div>
                    <p className="mb-1 text-dark fw-medium">
                      <span className="fw-semibold">Order ID:</span> {order._id}
                    </p>
                    <p className="mb-0 text-secondary small">
                      Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="mt-2 mt-md-0 text-md-end">
                    <p className="mb-1 fw-semibold text-primary">
                      ₹{order.totalAmount}
                    </p>
                    <p className={`mb-0 small fw-medium ${order.status === "Delivered" ? "text-success" : "text-warning"}`}>
                      {order.status || "Pending"}
                    </p>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="border-top pt-3">
                  <h3 className="h6 fw-semibold mb-2 text-dark">Items Ordered:</h3>
                  <ul className="list-unstyled mb-0">
                    {order.items.map((item) => (
                      <li key={item._id} className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-dark">{item.name}</span>
                        <span className="text-secondary small">
                          Qty: {item.quantity} × ₹{item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
