import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, loading } = 
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "1rem" }}>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h2 className="h4 fw-semibold text-secondary">Loading your cart...</h2>
      </div>
    );
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "1rem" }}>
        <h2 className="h4 fw-semibold text-secondary mb-3">Your Cart is Empty 🛒</h2>
        <p className="text-muted mb-4">Add some items to your cart to get started.</p>
        <Link to="/products" className="btn btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  const formatVariations = (variations) => {
    if (!variations || variations.length === 0) return "";
    return variations.map(v => `${v.type}: ${v.value}`).join(", ");
  };

  const getImageUrl = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return "https://via.placeholder.com/80x80/f8f9fa/6c757d?text=No+Image";
    }
    return images[0].startsWith('http') ? images[0] : `${import.meta.env.VITE_API_BASE_URL}${images[0]}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "3rem 1rem" }}>
      <div className="container">
        <div className="bg-white shadow rounded-3 p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h2 className="h2 fw-bold">Your Shopping Cart ({cartItems.length} items)</h2>
            {cartItems.length > 0 && (
              <button
                className="btn btn-outline-danger"
                onClick={clearCart}
                disabled={loading}
              >
                <i className="fas fa-trash me-2"></i>
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="d-flex flex-column gap-4">
            {Array.isArray(cartItems) && cartItems.map((item) => (
              <div key={`${item._id}-${JSON.stringify(item.variations)}`} className="d-flex flex-column flex-md-row align-items-center justify-content-between border-bottom pb-3">
                
                {/* Product Info */}
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={getImageUrl(item.images)}
                    alt={item.name}
                    className="img-fluid rounded shadow"
                    style={{ width: "96px", height: "96px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80x80/f8f9fa/6c757d?text=No+Image";
                    }}
                  />
                  <div>
                    <Link 
                      to={`/products/${item._id}`}
                      className="text-decoration-none"
                    >
                      <h3 className="h6 fw-semibold mb-1 text-dark">{item.name}</h3>
                    </Link>
                    <p className="mb-0 text-secondary">₹{(item.priceAtTime || item.price || 0).toFixed(2)}</p>
                    {item.category && (
                      <small className="text-muted d-block">{item.category.name || item.category}</small>
                    )}
                    {item.variations && item.variations.length > 0 && (
                      <small className="text-info d-block">
                        {formatVariations(item.variations)}
                      </small>
                    )}
                  </div>
                </div>

                {/* Quantity + Actions */}
                <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
                  <div className="input-group" style={{ maxWidth: "140px" }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item._id, Math.max(item.quantity - 1, 1))}
                      disabled={loading || item.quantity <= 1}
                    >
                      −
                    </button>
                    <input 
                      type="number"
                      className="form-control text-center"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const maxQuantity = item.stock || 999;
                        updateQuantity(item._id, Math.max(1, Math.min(maxQuantity, value)));
                      }}
                      min="1"
                      max={item.stock || 999}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        const maxQuantity = item.stock || 999;
                        updateQuantity(item._id, Math.min(maxQuantity, item.quantity + 1));
                      }}
                      disabled={loading || item.quantity >= (item.stock || 999)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="btn btn-link text-danger p-0 ms-2"
                    title="Remove item"
                    disabled={loading}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                {item.stock && item.quantity >= item.stock && (
                  <small className="text-warning d-block mt-1">
                    Max stock reached
                  </small>
                )}
              </div>
            ))}
          </div>

          {/* Total & Checkout */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mt-md-5">
            <div>
              <h3 className="h4 fw-semibold mb-1">Total: ₹{totalAmount.toFixed(2)}</h3>
              {!user && (
                <small className="text-info">
                  <Link to="/login" className="text-decoration-none">
                    Login
                  </Link>{" "}
                  to save your cart and access checkout
                </small>
              )}
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Link to="/products" className="btn btn-outline-secondary">
                Continue Shopping
              </Link>
              <button
                onClick={() => navigate("/checkout")}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
