import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal } =
    useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
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
            {cartItems.map((item) => (
              <div key={item._id} className="d-flex flex-column flex-md-row align-items-center justify-content-between border-bottom pb-3">
                
                {/* Product Info */}
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.image || "/placeholder.jpg"}
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
                  <div className="input-group">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        updateQuantity(item._id, Math.max(item.quantity - 1, 1))
                      }
                    >
                      −
                    </button>
                    <span className="input-group-text">{item.quantity}</span>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="btn btn-link text-danger p-0 ms-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total & Checkout */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mt-md-5">
            <h3 className="h4 fw-semibold mb-3 mb-md-0">Total: ₹{getTotal()}</h3>
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
