import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount } =
    useContext(CartContext);
  const navigate = useNavigate();

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "1rem" }}>
        <h2 className="h4 fw-semibold text-secondary mb-3">Your Cart is Empty 🛒</h2>
        <Link to="/products" className="btn btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "3rem 1rem" }}>
      <div className="container">
        <div className="bg-white shadow rounded-3 p-4 p-md-5">
          <h2 className="h2 fw-bold text-center mb-5">Your Shopping Cart</h2>

          {/* Cart Items */}
          <div className="d-flex flex-column gap-4">
            {Array.isArray(cartItems) && cartItems.map((item) => (
              <div key={item._id} className="d-flex flex-column flex-md-row align-items-center justify-content-between border-bottom pb-3">
                
                {/* Product Info */}
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/80x80/f8f9fa/6c757d?text=No+Image"}
                    alt={item.name}
                    className="img-fluid rounded shadow"
                    style={{ width: "96px", height: "96px", objectFit: "cover" }}
                  />
                  <div>
                    <h3 className="h6 fw-semibold mb-1">{item.name}</h3>
                    <p className="mb-0 text-secondary">₹{item.price}</p>
                  </div>
                </div>

                {/* Quantity + Actions */}
                <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
                  <div className="input-group" style={{ maxWidth: "140px" }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        updateQuantity(item._id, Math.max(item.quantity - 1, 1))
                      }
                    >
                      −
                    </button>
                    <input 
                      type="number"
                      className="form-control text-center"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        updateQuantity(item._id, Math.max(1, Math.min(999, value)));
                      }}
                      min="1"
                      max="999"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item._id, Math.min(999, item.quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="btn btn-link text-danger p-0 ms-2"
                    title="Remove item"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total & Checkout */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mt-md-5">
            <h3 className="h4 fw-semibold mb-3 mb-md-0">Total: ₹{totalAmount}</h3>
            <button
              onClick={() => navigate("/checkout")}
              className="btn btn-primary"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
