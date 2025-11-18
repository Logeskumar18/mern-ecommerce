import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import PaymentForm from "../components/PaymentForm";
import { Truck, MapPin, Package, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";

const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useContext(CartContext);
  const { token, user } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState(null);

  const shippingCost = 99;
  const tax = Math.round(totalAmount * 0.18); // 18% GST
  const finalTotal = totalAmount + shippingCost + tax;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    const requiredFields = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
    for (let field of requiredFields) {
      if (!address[field].trim()) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Validate phone number
    if (!/^\d{10}$/.test(address.phone)) {
      setError("Phone number must be 10 digits");
      return false;
    }
    
    // Validate pincode
    if (!/^\d{6}$/.test(address.pincode)) {
      setError("Pincode must be 6 digits");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setCurrentStep(2);
    }
  };

  const handlePaymentSubmit = async (paymentResult, paymentData) => {
    if (!paymentResult.success) {
      setError(paymentResult.error || "Payment failed");
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        cartItems,
        shippingAddress: address,
        paymentDetails: {
          method: paymentData.paymentMethod,
          transactionId: paymentResult.transactionId,
          amount: finalTotal
        },
        orderSummary: {
          subtotal: totalAmount,
          shipping: shippingCost,
          tax: tax,
          total: finalTotal
        }
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderResult({
          orderId: data.order._id,
          transactionId: paymentResult.transactionId,
          ...paymentResult
        });
        clearCart();
        setCurrentStep(3);
      } else {
        setError(data.message || "Failed to place order");
      }
    } catch (err) {
      setError("Something went wrong while placing your order");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !user) {
    return (
      <div className={`d-flex flex-column justify-content-center align-items-center text-center ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`} style={{ minHeight: "100vh", padding: "1rem" }}>
        <div className="card p-5 text-center">
          <h2 className="h4 fw-semibold mb-3">Please login to checkout 🔐</h2>
          <button onClick={() => navigate("/login")} className="btn btn-primary">
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className={`d-flex flex-column justify-content-center align-items-center text-center ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`} style={{ minHeight: "100vh", padding: "1rem" }}>
        <div className="card p-5 text-center">
          <Package size={64} className="text-muted mb-3 mx-auto" />
          <h2 className="h4 fw-semibold mb-3">Your cart is empty 🛒</h2>
          <button onClick={() => navigate("/products")} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="container py-5">
        {/* Progress Steps */}
        <div className="row justify-content-center mb-5">
          <div className="col-12 col-md-8">
            <div className="d-flex align-items-center justify-content-between">
              {[
                { step: 1, icon: MapPin, label: "Shipping" },
                { step: 2, icon: CreditCard, label: "Payment" },
                { step: 3, icon: CheckCircle, label: "Confirmation" }
              ].map(({ step, icon: Icon, label }) => (
                <div key={step} className="d-flex flex-column align-items-center">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                    step <= currentStep 
                      ? 'bg-primary text-white' 
                      : 'bg-secondary text-muted'
                  }`} style={{ width: '48px', height: '48px' }}>
                    <Icon size={24} />
                  </div>
                  <small className={step <= currentStep ? 'text-primary fw-bold' : 'text-muted'}>
                    {label}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="row justify-content-center mb-4">
            <div className="col-12 col-lg-8">
              <div className="alert alert-danger d-flex align-items-center">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Main Content */}
          <div className="col-12 col-lg-8">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <div className={`card ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                <div className="card-header d-flex align-items-center gap-2">
                  <Truck size={20} />
                  <h5 className="mb-0">Shipping Information</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleShippingSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={address.fullName}
                          onChange={handleAddressChange}
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={address.email}
                          onChange={handleAddressChange}
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={address.phone}
                          onChange={handleAddressChange}
                          placeholder="10-digit mobile number"
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={address.pincode}
                          onChange={handleAddressChange}
                          placeholder="6-digit pincode"
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Street Address *</label>
                        <textarea
                          name="street"
                          value={address.street}
                          onChange={handleAddressChange}
                          placeholder="House/Flat no., Building name, Street name"
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          rows="2"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleAddressChange}
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Landmark</label>
                        <input
                          type="text"
                          name="landmark"
                          value={address.landmark}
                          onChange={handleAddressChange}
                          placeholder="Near hospital, park etc."
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-4">
                      <button type="button" onClick={() => navigate('/cart')} className="btn btn-outline-secondary">
                        <ArrowLeft size={16} className="me-1" />
                        Back to Cart
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h5 className="mb-0">Payment</h5>
                </div>
                <PaymentForm 
                  orderTotal={finalTotal}
                  onPaymentSubmit={handlePaymentSubmit}
                  loading={loading}
                />
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && orderResult && (
              <div className={`card ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                <div className="card-header bg-success text-white text-center">
                  <CheckCircle size={48} className="mb-2" />
                  <h4 className="mb-0">Order Placed Successfully!</h4>
                </div>
                <div className="card-body text-center">
                  <div className="mb-4">
                    <h5>Order ID: #{orderResult.orderId}</h5>
                    {orderResult.transactionId && (
                      <p className="text-muted">Transaction ID: {orderResult.transactionId}</p>
                    )}
                  </div>
                  <div className="row g-3 justify-content-center">
                    <div className="col-auto">
                      <button 
                        onClick={() => navigate('/orders')} 
                        className="btn btn-primary"
                      >
                        View Orders
                      </button>
                    </div>
                    <div className="col-auto">
                      <button 
                        onClick={() => navigate('/products')} 
                        className="btn btn-outline-primary"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="col-12 col-lg-4">
            <div className={`card position-sticky ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`} style={{ top: '20px' }}>
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3 mb-3">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item._id} className="d-flex align-items-center gap-3">
                      <img 
                        src={item.images?.[0] || 'https://via.placeholder.com/60'} 
                        alt={item.name}
                        className="rounded"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 small">{item.name}</h6>
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </div>
                      <div className="text-end">
                        <small className="fw-bold">₹{(item.price * item.quantity).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <small className="text-muted text-center">
                      ... and {cartItems.length - 3} more items
                    </small>
                  )}
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>₹{shippingCost}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax}</span>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between fw-bold h5">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
