import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { 
  Heart, ShoppingCart, Star, Trash2, Package, 
  Eye, ArrowRight, Grid, List 
} from "lucide-react";

const Wishlist = () => {
  const { user, token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { isDarkMode } = useTheme();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/wishlist/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlistItems(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}/wishlist`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const moveToCart = (item) => {
    addToCart(item.product);
    removeFromWishlist(item.product._id);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        size={14} 
        className={index < Math.floor(rating) ? "text-warning" : "text-muted"}
        fill={index < Math.floor(rating) ? "currentColor" : "none"}
      />
    ));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const WishlistCard = ({ item }) => (
    <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary text-light' : ''}`}>
      <div className="position-relative">
        <Link to={`/products/${item.product._id}`}>
          <img
            src={item.product.images?.[0] || "https://via.placeholder.com/300x200"}
            alt={item.product.name}
            className="card-img-top"
            style={{ height: "200px", objectFit: "cover" }}
          />
        </Link>
        
        <button
          onClick={() => removeFromWishlist(item.product._id)}
          className="btn btn-danger position-absolute top-0 end-0 m-2"
          title="Remove from wishlist"
        >
          <Trash2 size={16} />
        </button>

        {item.product.discount > 0 && (
          <span className="badge bg-danger position-absolute top-0 start-0 m-2">
            {item.product.discount}% OFF
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="flex-grow-1">
          <Link 
            to={`/products/${item.product._id}`} 
            className="text-decoration-none"
          >
            <h6 className={`card-title ${isDarkMode ? 'text-light' : 'text-dark'}`}>
              {item.product.name}
            </h6>
          </Link>
          
          <div className="d-flex align-items-center mb-2">
            {item.product.ratings?.average > 0 ? (
              <>
                <div className="d-flex me-2">
                  {renderStars(item.product.ratings.average)}
                </div>
                <small className="text-muted">
                  {item.product.ratings.average} ({item.product.ratings.count})
                </small>
              </>
            ) : (
              <small className="text-muted">No reviews yet</small>
            )}
          </div>

          {item.product.brand && item.product.brand !== 'Unknown' && (
            <small className="text-muted d-block mb-2">
              Brand: {item.product.brand}
            </small>
          )}

          <p className="card-text text-muted small" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {item.product.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {item.product.discount > 0 ? (
                <>
                  <span className="fw-bold text-primary fs-6">
                    {formatPrice(item.product.price * (1 - item.product.discount / 100))}
                  </span>
                  <small className="text-muted text-decoration-line-through ms-2">
                    {formatPrice(item.product.price)}
                  </small>
                </>
              ) : (
                <span className="fw-bold text-primary fs-6">
                  {formatPrice(item.product.price)}
                </span>
              )}
            </div>
            <small className={`badge ${item.product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
              {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </small>
          </div>
          
          <div className="d-grid gap-2">
            <div className="btn-group">
              <button
                onClick={() => moveToCart(item)}
                className="btn btn-primary btn-sm"
                disabled={item.product.stock === 0}
              >
                <ShoppingCart size={14} className="me-1" />
                Move to Cart
              </button>
              <Link 
                to={`/products/${item.product._id}`}
                className="btn btn-outline-primary btn-sm"
              >
                <Eye size={14} />
              </Link>
            </div>
          </div>

          <small className="text-muted d-block mt-2">
            Added on {new Date(item.addedAt).toLocaleDateString()}
          </small>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className={`min-vh-100 d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="text-center">
          <Heart size={64} className="text-muted mb-3" />
          <h4 className={isDarkMode ? 'text-light' : 'text-dark'}>Please Login</h4>
          <p className="text-muted mb-4">You need to be logged in to view your wishlist</p>
          <Link to="/login" className="btn btn-primary">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-vh-100 d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className={isDarkMode ? 'text-light' : 'text-muted'}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
              <Heart size={24} className="me-2" />
              My Wishlist
            </h1>
            <p className="text-muted mb-0">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="d-flex gap-2 align-items-center">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-5">
            <Heart size={64} className="text-muted mb-3" />
            <h5 className={`text-muted mb-3 ${isDarkMode ? 'text-light' : ''}`}>
              Your wishlist is empty
            </h5>
            <p className="text-muted mb-4">
              Save items you love by clicking the heart icon on product pages
            </p>
            <Link to="/products" className="btn btn-primary">
              <Package size={16} className="me-2" />
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            <div className={`card mb-4 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Quick Actions</h6>
                    <small className="text-muted">
                      Manage all your wishlist items
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        wishlistItems.forEach(item => {
                          if (item.product.stock > 0) {
                            moveToCart(item);
                          }
                        });
                      }}
                    >
                      <ShoppingCart size={14} className="me-1" />
                      Add All to Cart
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                          wishlistItems.forEach(item => removeFromWishlist(item.product._id));
                        }
                      }}
                    >
                      <Trash2 size={14} className="me-1" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Grid/List */}
            <div className={viewMode === 'grid' ? 'row g-4' : ''}>
              {wishlistItems.map((item) => (
                <div key={item.product._id} className={viewMode === 'grid' ? 'col-md-6 col-xl-4' : 'mb-3'}>
                  {viewMode === 'grid' ? (
                    <WishlistCard item={item} />
                  ) : (
                    <div className={`card ${isDarkMode ? 'bg-dark border-secondary text-light' : ''}`}>
                      <div className="row g-0">
                        <div className="col-md-3">
                          <Link to={`/products/${item.product._id}`}>
                            <img
                              src={item.product.images?.[0] || "https://via.placeholder.com/150x150"}
                              alt={item.product.name}
                              className="img-fluid rounded-start"
                              style={{ height: "150px", width: "100%", objectFit: "cover" }}
                            />
                          </Link>
                        </div>
                        <div className="col-md-9">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <Link 
                                  to={`/products/${item.product._id}`} 
                                  className="text-decoration-none"
                                >
                                  <h6 className={`card-title ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                                    {item.product.name}
                                  </h6>
                                </Link>
                                
                                <div className="d-flex align-items-center mb-2">
                                  {item.product.ratings?.average > 0 ? (
                                    <>
                                      <div className="d-flex me-2">
                                        {renderStars(item.product.ratings.average)}
                                      </div>
                                      <small className="text-muted">
                                        {item.product.ratings.average} ({item.product.ratings.count})
                                      </small>
                                    </>
                                  ) : (
                                    <small className="text-muted">No reviews yet</small>
                                  )}
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    {item.product.discount > 0 ? (
                                      <>
                                        <span className="fw-bold text-primary">
                                          {formatPrice(item.product.price * (1 - item.product.discount / 100))}
                                        </span>
                                        <small className="text-muted text-decoration-line-through ms-2">
                                          {formatPrice(item.product.price)}
                                        </small>
                                      </>
                                    ) : (
                                      <span className="fw-bold text-primary">
                                        {formatPrice(item.product.price)}
                                      </span>
                                    )}
                                  </div>
                                  <small className={`badge ${item.product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                    {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                  </small>
                                </div>
                              </div>
                              
                              <div className="d-flex flex-column gap-2 ms-3">
                                <button
                                  onClick={() => moveToCart(item)}
                                  className="btn btn-primary btn-sm"
                                  disabled={item.product.stock === 0}
                                >
                                  <ShoppingCart size={14} className="me-1" />
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => removeFromWishlist(item.product._id)}
                                  className="btn btn-outline-danger btn-sm"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="text-center mt-5">
              <Link to="/products" className="btn btn-outline-primary">
                <ArrowRight size={16} className="me-2" />
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;