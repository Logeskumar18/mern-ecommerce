import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Invoice from "../components/Invoice";
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Orders = () => {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const invoiceRef = useRef();

  // Company information for invoice
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

  // Print invoice using react-to-print
  const handlePrintInvoice = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${selectedOrder?._id?.slice(-8)}`,
    onBeforeGetContent: () => {
      setShowInvoice(true);
      return new Promise((resolve) => {
        setTimeout(resolve, 100); // Wait for component to render
      });
    },
    onAfterPrint: () => {
      setShowInvoice(false);
    }
  });

  // Download invoice as PDF
  const handleDownloadPDF = async (order) => {
    setDownloadingPDF(true);
    setSelectedOrder(order);
    setShowInvoice(true);
    
    try {
      // Wait for component to render
      setTimeout(async () => {
        const element = invoiceRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: element.offsetWidth,
          height: element.offsetHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${order._id.slice(-8)}.pdf`);
        
        setShowInvoice(false);
        setDownloadingPDF(false);
      }, 500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setDownloadingPDF(false);
      setShowInvoice(false);
    }
  };

  // View invoice in modal/new tab
  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id || !token) {
        setError("Please login to view orders");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/user/${user._id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok) setOrders(Array.isArray(data) ? data : []);
        else setError("Failed to fetch orders");
      } catch (err) {
        setError("Something went wrong while fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

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
            {Array.isArray(orders) && orders.map((order) => (
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
                    <p className={`mb-2 small fw-medium ${
                      order.orderStatus === "Delivered" ? "text-success" : 
                      order.orderStatus === "Shipped" ? "text-info" :
                      order.orderStatus === "Processing" ? "text-warning" :
                      "text-secondary"
                    }`}>
                      {order.orderStatus || "Pending"}
                    </p>
                    
                    {/* Invoice Actions */}
                    <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleViewInvoice(order)}
                        title="View Invoice"
                      >
                        <i className="fas fa-eye me-1"></i> View
                      </button>
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          handlePrintInvoice();
                        }}
                        title="Print Invoice"
                      >
                        <i className="fas fa-print me-1"></i> Print
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownloadPDF(order)}
                        disabled={downloadingPDF}
                        title="Download PDF Invoice"
                      >
                        {downloadingPDF && selectedOrder?._id === order._id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download me-1"></i> PDF
                          </>
                        )}
                      </button>
                    </div>
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

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-fullscreen-lg-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-file-invoice me-2 text-primary"></i>
                  Invoice - {selectedOrder?._id?.slice(-8)?.toUpperCase()}
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
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download me-1"></i> Download PDF
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowInvoice(false)}
                  ></button>
                </div>
              </div>
              <div className="modal-body p-0" style={{maxHeight: '80vh', overflow: 'auto'}}>
                {selectedOrder && (
                  <Invoice 
                    ref={invoiceRef}
                    order={selectedOrder} 
                    companyInfo={companyInfo}
                  />
                )}
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

export default Orders;
