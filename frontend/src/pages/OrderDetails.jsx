import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const OrderDetails = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError("Please login to view order details");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok) setOrder(data);
        else setError("Failed to fetch order details");
      } catch (err) {
        setError("Something went wrong while fetching the order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center text-secondary" style={{ minHeight: "100vh" }}>
        Loading order details...
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

  if (!order) return null;

  return (
    <div className="bg-light py-5 px-3" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="bg-white shadow rounded-3 p-4 p-md-5">
          <h2 className="h3 fw-bold mb-5 text-center text-dark">Order Details</h2>

          {/* Order Summary */}
          <div className="mb-4 border-bottom pb-3">
            <p className="mb-1 text-dark fw-medium">
              <span className="fw-semibold">Order ID:</span> {order._id}
            </p>
            <p className="mb-1 text-secondary small">
              Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>
            <p className={`fw-semibold mt-1 ${order.status === "Delivered" ? "text-success" : "text-warning"}`}>
              Status: {order.status}
            </p>
            <p className="text-primary h5 fw-bold mt-2">
              Total: ₹{order.totalAmount}
            </p>
          </div>

          {/* Ordered Items */}
          <div className="mb-4">
            <h3 className="h5 fw-semibold text-dark mb-3">Ordered Items</h3>
            <div className="d-flex flex-column gap-3">
              {order.items.map((item) => (
                <div key={item._id} className="d-flex justify-content-between align-items-center border rounded p-3 bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.images?.[0] || "https://via.placeholder.com/80x80/f8f9fa/6c757d?text=No+Image"}
                      alt={item.name}
                      className="rounded" 
                      style={{ width: "64px", height: "64px", objectFit: "cover" }}
                    />
                    <div>
                      <p className="mb-1 fw-medium text-dark">{item.name}</p>
                      <p className="mb-0 small text-secondary">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                  </div>
                  <p className="mb-0 fw-semibold text-dark">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Details */}
          <div className="border-top pt-3 mb-4">
            <h3 className="h5 fw-semibold text-dark mb-3">Shipping Address</h3>
            <div className="text-dark small">
              <p className="mb-1">{order.address.fullName}</p>
              <p className="mb-1">{order.address.street}</p>
              <p className="mb-1">
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p className="mb-0">Phone: {order.address.phone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-top pt-3">
            <h3 className="h5 fw-semibold text-dark mb-3">Payment Information</h3>
            <p className="mb-1 text-dark">
              Method: <span className="fw-medium">{order.paymentMethod || "Cash on Delivery"}</span>
            </p>
            <p className="mb-0 text-dark">
              Payment Status:{" "}
              <span className={`fw-medium ${order.paymentStatus === "Paid" ? "text-success" : "text-warning"}`}>
                {order.paymentStatus || "Pending"}
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
