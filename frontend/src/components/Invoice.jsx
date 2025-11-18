import React, { forwardRef } from 'react';

const Invoice = forwardRef(({ order, companyInfo }, ref) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
  
  // Calculate totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = order.totalAmount > 500 ? 0 : 50; // Free shipping above ₹500
  const discount = order.discount || 0;
  const total = order.totalAmount;

  return (
    <div ref={ref} className="p-4" style={{ backgroundColor: 'white', minHeight: '297mm', width: '210mm', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      {/* Invoice Header */}
      <div className="row mb-4 border-bottom pb-3">
        <div className="col-md-6">
          <h1 className="h2 fw-bold text-primary mb-2">{companyInfo.name}</h1>
          <p className="mb-1 text-muted">{companyInfo.address}</p>
          <p className="mb-1 text-muted">{companyInfo.city}, {companyInfo.state} - {companyInfo.pincode}</p>
          <p className="mb-1 text-muted">Email: {companyInfo.email}</p>
          <p className="mb-0 text-muted">Phone: {companyInfo.phone}</p>
          {companyInfo.gst && <p className="mb-0 text-muted fw-semibold">GST: {companyInfo.gst}</p>}
        </div>
        <div className="col-md-6 text-end">
          <h2 className="h1 fw-bold text-dark mb-3">INVOICE</h2>
          <div className="bg-light p-3 rounded">
            <p className="mb-1"><strong>Invoice #:</strong> INV-{order._id.slice(-8).toUpperCase()}</p>
            <p className="mb-1"><strong>Order ID:</strong> {order._id}</p>
            <p className="mb-1"><strong>Invoice Date:</strong> {currentDate}</p>
            <p className="mb-0"><strong>Order Date:</strong> {orderDate}</p>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h5 className="fw-bold mb-3 text-primary">Bill To:</h5>
          <div className="bg-light p-3 rounded">
            <p className="mb-1 fw-semibold">{order.shippingAddress?.fullName || 'Customer Name'}</p>
            <p className="mb-1">{order.shippingAddress?.address}</p>
            <p className="mb-1">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
            <p className="mb-1">{order.shippingAddress?.country}</p>
            <p className="mb-0">Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>
        <div className="col-md-6">
          <h5 className="fw-bold mb-3 text-primary">Payment Details:</h5>
          <div className="bg-light p-3 rounded">
            <p className="mb-1"><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p className="mb-1"><strong>Payment Status:</strong> 
              <span className={`badge ms-2 ${
                order.paymentStatus === 'Completed' ? 'bg-success' :
                order.paymentStatus === 'Pending' ? 'bg-warning' :
                'bg-danger'
              }`}>
                {order.paymentStatus}
              </span>
            </p>
            <p className="mb-0"><strong>Order Status:</strong>
              <span className={`badge ms-2 ${
                order.orderStatus === 'Delivered' ? 'bg-success' :
                order.orderStatus === 'Shipped' ? 'bg-info' :
                order.orderStatus === 'Processing' ? 'bg-warning' :
                'bg-secondary'
              }`}>
                {order.orderStatus}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3 text-primary">Items Ordered:</h5>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-primary">
              <tr>
                <th style={{width: '50px'}}>#</th>
                <th>Product Name</th>
                <th style={{width: '100px'}}>Unit Price</th>
                <th style={{width: '80px'}}>Quantity</th>
                <th style={{width: '120px'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item._id || index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <strong>{item.name || item.product?.name || 'Product'}</strong>
                    {item.description && <br />}
                    {item.description && <small className="text-muted">{item.description}</small>}
                  </td>
                  <td className="text-end">₹{item.price?.toLocaleString()}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end fw-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="row">
        <div className="col-md-6">
          <div className="bg-light p-3 rounded">
            <h6 className="fw-bold mb-2">Terms & Conditions:</h6>
            <ul className="small text-muted mb-0" style={{listStyle: 'none', padding: 0}}>
              <li>• All products are covered under standard warranty</li>
              <li>• Returns accepted within 7 days of delivery</li>
              <li>• Free shipping on orders above ₹500</li>
              <li>• For support, contact: {companyInfo.email}</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-primary text-white p-3 rounded">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span>Discount:</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-2">
              <span>GST (18%):</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <hr className="border-light" />
            <div className="d-flex justify-content-between fs-5 fw-bold">
              <span>Total:</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4 pt-3 border-top">
        <p className="text-muted small mb-1">Thank you for choosing {companyInfo.name}!</p>
        <p className="text-muted small mb-0">This is a computer-generated invoice and does not require a signature.</p>
        <p className="text-muted small mb-0 mt-2">
          Generated on: {new Date().toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice;