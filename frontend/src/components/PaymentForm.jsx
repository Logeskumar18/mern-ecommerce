import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PaymentForm = ({ orderTotal, onPaymentSubmit, loading = false }) => {
  const { isDarkMode } = useTheme();
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });
  const [errors, setErrors] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (paymentData.paymentMethod === 'card') {
      if (!paymentData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }

      if (!paymentData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (paymentData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date format (MM/YY)';
      }

      if (!paymentData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (paymentData.cvv.length < 3) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    }

    // Billing address validation
    if (!paymentData.billingAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!paymentData.billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!paymentData.billingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!paymentData.billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessingPayment(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, you would integrate with a payment gateway here
      const paymentResult = {
        success: true,
        transactionId: `TXN_${Date.now()}`,
        paymentMethod: paymentData.paymentMethod,
        amount: orderTotal,
        timestamp: new Date().toISOString()
      };

      onPaymentSubmit(paymentResult, paymentData);
    } catch (error) {
      console.error('Payment processing error:', error);
      onPaymentSubmit({ success: false, error: 'Payment processing failed' }, paymentData);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field] || errors[field.split('.')[1]]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors[field.split('.')[1]];
        return newErrors;
      });
    }
  };

  return (
    <div className={`card ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}>
      <div className="card-header d-flex align-items-center gap-2">
        <CreditCard size={20} />
        <h5 className="mb-0">Payment Details</h5>
        <Lock size={16} className="ms-auto text-success" title="Secure Payment" />
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="form-label fw-bold">Payment Method</label>
            <div className="row g-2">
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="card"
                    value="card"
                    checked={paymentData.paymentMethod === 'card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="card">
                    <CreditCard size={16} className="me-1" />
                    Credit/Debit Card
                  </label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="upi"
                    value="upi"
                    checked={paymentData.paymentMethod === 'upi'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="upi">
                    📱 UPI Payment
                  </label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    value="cod"
                    checked={paymentData.paymentMethod === 'cod'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="cod">
                    💰 Cash on Delivery
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Card Details (only show if card payment is selected) */}
          {paymentData.paymentMethod === 'card' && (
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Cardholder Name *</label>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.cardholderName ? 'is-invalid' : ''}`}
                    placeholder="John Doe"
                    value={paymentData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  />
                  {errors.cardholderName && <div className="invalid-feedback">{errors.cardholderName}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label">Card Number *</label>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.cardNumber ? 'is-invalid' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength="19"
                  />
                  {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Expiry Date *</label>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.expiryDate ? 'is-invalid' : ''}`}
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    maxLength="5"
                  />
                  {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">CVV *</label>
                  <input
                    type="password"
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.cvv ? 'is-invalid' : ''}`}
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    maxLength="4"
                  />
                  {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
                </div>
              </div>
            </div>
          )}

          {/* UPI Details */}
          {paymentData.paymentMethod === 'upi' && (
            <div className="mb-4">
              <div className="alert alert-info d-flex align-items-center">
                <AlertCircle size={20} className="me-2" />
                <div>
                  <strong>UPI Payment</strong>
                  <p className="mb-0 small">You will be redirected to your UPI app to complete the payment.</p>
                </div>
              </div>
            </div>
          )}

          {/* COD Notice */}
          {paymentData.paymentMethod === 'cod' && (
            <div className="mb-4">
              <div className="alert alert-warning d-flex align-items-center">
                <AlertCircle size={20} className="me-2" />
                <div>
                  <strong>Cash on Delivery</strong>
                  <p className="mb-0 small">Pay ₹{orderTotal.toLocaleString()} when your order is delivered.</p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Address */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Billing Address</h6>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.street ? 'is-invalid' : ''}`}
                  placeholder="123 Main Street, Apartment 4B"
                  value={paymentData.billingAddress.street}
                  onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                />
                {errors.street && <div className="invalid-feedback">{errors.street}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.city ? 'is-invalid' : ''}`}
                  placeholder="Mumbai"
                  value={paymentData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                />
                {errors.city && <div className="invalid-feedback">{errors.city}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.state ? 'is-invalid' : ''}`}
                  placeholder="Maharashtra"
                  value={paymentData.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                />
                {errors.state && <div className="invalid-feedback">{errors.state}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">ZIP Code *</label>
                <input
                  type="text"
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''} ${errors.zipCode ? 'is-invalid' : ''}`}
                  placeholder="400001"
                  value={paymentData.billingAddress.zipCode}
                  onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                />
                {errors.zipCode && <div className="invalid-feedback">{errors.zipCode}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Country</label>
                <select
                  className={`form-select ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  value={paymentData.billingAddress.country}
                  onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-top pt-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Total Amount:</h6>
              <h5 className="text-primary fw-bold mb-0">₹{orderTotal.toLocaleString()}</h5>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={loading || processingPayment}
          >
            {processingPayment ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Lock size={20} />
                {paymentData.paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Securely'}
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="text-center mt-3">
            <small className="text-muted d-flex align-items-center justify-content-center gap-1">
              <CheckCircle size={14} className="text-success" />
              Your payment information is encrypted and secure
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;