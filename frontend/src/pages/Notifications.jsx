import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Mock notifications data
        const mockNotifications = [
          {
            id: 1,
            title: "Welcome to MERN Shop!",
            message: "Thank you for joining our platform. Explore our wide range of products and enjoy shopping!",
            type: "info",
            isRead: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            icon: "fas fa-info-circle"
          },
          {
            id: 2,
            title: "New Products Available",
            message: "Check out our latest electronics collection with amazing discounts up to 50% off!",
            type: "success",
            isRead: false,
            createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            icon: "fas fa-shopping-bag"
          },
          {
            id: 3,
            title: "Order Confirmation",
            message: "Your order #ORD123456 has been confirmed and is being processed.",
            type: "success",
            isRead: true,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            icon: "fas fa-check-circle"
          },
          {
            id: 4,
            title: "Flash Sale Alert!",
            message: "Don't miss our 24-hour flash sale on fashion items. Limited time offer!",
            type: "warning",
            isRead: true,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            icon: "fas fa-fire"
          },
          {
            id: 5,
            title: "Profile Updated",
            message: "Your profile information has been successfully updated.",
            type: "info",
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            icon: "fas fa-user"
          },
          {
            id: 6,
            title: "Payment Received",
            message: "We have received your payment for order #ORD123455. Thank you!",
            type: "success",
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            icon: "fas fa-credit-card"
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "read") return notif.isRead;
    return true;
  });

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "success": return "text-success";
      case "warning": return "text-warning";
      case "error": return "text-danger";
      default: return "text-info";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "success": return "bg-success";
      case "warning": return "bg-warning";
      case "error": return "bg-danger";
      default: return "bg-info";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa", paddingTop: "2rem" }}>
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              <i className="fas fa-bell me-3 text-primary"></i>
              Notifications
            </h1>
            <p className="text-muted">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          <Link to="/" className="btn btn-outline-primary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Home
          </Link>
        </div>

        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-filter me-2"></i>
                  Filters
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button 
                    className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("all")}
                  >
                    All Notifications
                    <span className="badge bg-secondary ms-2">{notifications.length}</span>
                  </button>
                  <button 
                    className={`btn ${filter === "unread" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("unread")}
                  >
                    Unread
                    <span className="badge bg-danger ms-2">{unreadCount}</span>
                  </button>
                  <button 
                    className={`btn ${filter === "read" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("read")}
                  >
                    Read
                    <span className="badge bg-secondary ms-2">{notifications.length - unreadCount}</span>
                  </button>
                </div>
                
                {unreadCount > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <button 
                      className="btn btn-sm btn-outline-success w-100"
                      onClick={markAllAsRead}
                    >
                      <i className="fas fa-check-double me-2"></i>
                      Mark All as Read
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <p className="text-muted">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-bell-slash text-muted mb-3" style={{ fontSize: "3rem" }}></i>
                <h4 className="text-muted mb-3">No notifications found</h4>
                <p className="text-muted">
                  {filter === "unread" ? "All notifications have been read" : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`card mb-3 shadow-sm notification-card ${!notification.isRead ? 'border-primary' : ''}`}
                    style={{ transition: "all 0.3s ease" }}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-start">
                        {/* Icon */}
                        <div 
                          className={`flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center me-3 ${getTypeBadge(notification.type)}`}
                          style={{ width: "40px", height: "40px" }}
                        >
                          <i className={`${notification.icon} text-white`}></i>
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>
                              {notification.title}
                              {!notification.isRead && (
                                <span className="badge bg-primary ms-2" style={{ fontSize: "0.7rem" }}>
                                  New
                                </span>
                              )}
                            </h6>
                            <small className="text-muted">{getTimeAgo(notification.createdAt)}</small>
                          </div>
                          
                          <p className="text-muted mb-3">{notification.message}</p>
                          
                          {/* Actions */}
                          <div className="d-flex gap-2">
                            {!notification.isRead && (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <i className="fas fa-check me-1"></i>
                                Mark as Read
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <i className="fas fa-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;