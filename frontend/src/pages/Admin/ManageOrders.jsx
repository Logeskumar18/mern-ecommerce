import React, { useEffect, useState, useRef } from "react";
import { Package, Eye, Edit, FileText, Download, Truck, CheckCircle, Clock } from "lucide-react";
import Invoice from "../../components/Invoice";
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  
  const invoiceRef = useRef();
  const token = localStorage.getItem("token");

  // Company info for invoices
  const companyInfo = {
    name: "MERN E-Commerce Store",
    address: "123 Business Street, Tech Tower",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    email: "contact@mernecommerce.com",
    phone: "+91 98765 43210",
    gst: "27XXXXX1234X1ZX"
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.status !== 'all' && { status: filters.status })
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/admin/all?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setMessage("");
      } else {
        setMessage("❌ Failed to fetch orders");
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage("❌ Server error while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      
      if (res.ok) {
        setMessage("✅ Order status updated successfully!");
        fetchOrders();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Failed to update order status");
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setMessage("❌ Server error while updating order");
    }
  };

  // Print invoice
  const handlePrintInvoice = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${selectedOrder?._id?.slice(-8)}`,
    onAfterPrint: () => setShowInvoice(false)
  });

  // Download PDF invoice
  const handleDownloadPDF = async (order) => {
    setDownloadingPDF(true);
    setSelectedOrder(order);
    setShowInvoice(true);
    
    setTimeout(async () => {
      try {
        const element = invoiceRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${order._id.slice(-8)}.pdf`);
        
        setShowInvoice(false);
        setDownloadingPDF(false);
      } catch (error) {
        console.error('PDF generation error:', error);
        setDownloadingPDF(false);
        setShowInvoice(false);
      }
    }, 500);
  };

  // View invoice
  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Processing': 'bg-warning',
      'Shipped': 'bg-info',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger',
      'Pending': 'bg-secondary'
    };
    return `badge ${statusClasses[status] || 'bg-secondary'}`;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Processing': return <Clock size={16} />;
      case 'Shipped': return <Truck size={16} />;
      case 'Delivered': return <CheckCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">
          <Package className="me-3 text-primary" size={32} />
          Manage Orders
        </h1>
        <button 
          className="btn btn-outline-primary"
          onClick={fetchOrders}
          disabled={loading}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filter by Status:</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                className="form-select"
              >
                <option value="all">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Orders per page:</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value), page: 1})}
                className="form-select"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Orders List ({orders.length} orders)</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-4">
              <Package className="text-muted mb-3" size={48} />
              <h5 className="text-muted">No orders found</h5>
              <p className="text-muted">No orders match the current filters</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th style={{width: '60px'}}>#</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th style={{width: '200px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id}>
                      <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                      <td>
                        <code className="text-primary">{order._id.slice(-8).toUpperCase()}</code>
                      </td>
                      <td>
                        <div>
                          <strong>{order.user?.name || 'N/A'}</strong>
                          <br />
                          <small className="text-muted">{order.user?.email}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td>
                        <strong className="text-success">₹{order.totalAmount.toLocaleString()}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getStatusIcon(order.orderStatus)}
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value, order.paymentStatus)}
                            className={`form-select form-select-sm ${getStatusBadge(order.orderStatus)}`}
                            style={{minWidth: '120px'}}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updateOrderStatus(order._id, order.orderStatus, e.target.value)}
                          className={`form-select form-select-sm badge ${
                            order.paymentStatus === 'Completed' ? 'bg-success' :
                            order.paymentStatus === 'Pending' ? 'bg-warning' :
                            'bg-danger'
                          }`}
                          style={{minWidth: '100px'}}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewInvoice(order)}
                            title="View Invoice"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => {
                              setSelectedOrder(order);
                              handlePrintInvoice();
                            }}
                            title="Print Invoice"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleDownloadPDF(order)}
                            disabled={downloadingPDF}
                            title="Download PDF"
                          >
                            {downloadingPDF && selectedOrder?._id === order._id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <Download size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setFilters({...filters, page: filters.page - 1})}
                  disabled={filters.page === 1}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${filters.page === i + 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setFilters({...filters, page: i + 1})}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${filters.page === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  disabled={filters.page === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-fullscreen-lg-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FileText className="me-2 text-primary" size={20} />
                  Invoice - {selectedOrder._id.slice(-8).toUpperCase()}
                </h5>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={handlePrintInvoice}
                  >
                    <i className="fas fa-print me-1"></i> Print
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownloadPDF(selectedOrder)}
                    disabled={downloadingPDF}
                  >
                    {downloadingPDF ? (
                      <span className="spinner-border spinner-border-sm me-1"></span>
                    ) : (
                      <Download className="me-1" size={16} />
                    )}
                    {downloadingPDF ? 'Downloading...' : 'Download PDF'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowInvoice(false)}
                  ></button>
                </div>
              </div>
              <div className="modal-body p-0" style={{maxHeight: '80vh', overflow: 'auto'}}>
                <Invoice 
                  ref={invoiceRef}
                  order={selectedOrder} 
                  companyInfo={companyInfo}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice for PDF Generation */}
      <div style={{position: 'absolute', left: '-9999px', top: '-9999px'}}>
        {selectedOrder && (
          <Invoice 
            ref={invoiceRef}
            order={selectedOrder} 
            companyInfo={companyInfo}
          />
        )}
      </div>
    </div>
  );
};

export default ManageOrders;