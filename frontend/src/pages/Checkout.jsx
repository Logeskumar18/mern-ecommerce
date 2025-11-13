import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cartItems, getTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e) => {
    e.preventDefault();

    if (!address.fullName || !address.phone || !address.street || !address.city) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, address }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Order placed successfully!");
        navigate("/orders");
      } else {
        setError(data.message || "Failed to place order");
      }
    } catch (err) {
      setError("Something went wrong while placing your order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "1rem" }}>
        <h2 className="h4 fw-semibold text-secondary mb-3">Your cart is empty 🛒</h2>
        <button
          onClick={() => navigate("/products")}
          className="btn btn-primary"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "3rem 1rem" }}>
      <div className="container">
        <div className="row g-4 g-md-5 bg-white shadow rounded-3 p-4 p-md-5">

          {/* Shipping Address Form */}
          <div className="col-12 col-md-6">
            <h2 className="h4 fw-bold mb-4">Shipping Details</h2>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleOrder} className="d-flex flex-column gap-3">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={address.fullName}
                onChange={handleChange}
                className="form-control"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={address.phone}
                onChange={handleChange}
                className="form-control"
                required
              />

              <input
                type="text"
                name="street"
                placeholder="Street Address"
                value={address.street}
                onChange={handleChange}
                className="form-control"
                required
              />

              <div className="row g-3">
                <div className="col-6">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-6">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={address.pincode}
                onChange={handleChange}
                className="form-control"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary mt-2"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="col-12 col-md-6">
            <h2 className="h4 fw-bold mb-4">Order Summary</h2>
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => (
                <div key={item._id} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <div>
                    <p className="mb-1 fw-medium">{item.name}</p>
                    <p className="mb-0 text-secondary small">Qty: {item.quantity}</p>
                  </div>
                  <p className="mb-0 fw-semibold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top fw-semibold fs-5">
              <span>Total:</span>
              <span>₹{getTotal()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
