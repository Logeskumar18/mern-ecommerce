import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/Toast";
import { 
  Heart, Share, ArrowLeft, ShoppingCart, Star, Eye, 
  MessageCircle, ThumbsUp, Plus, Minus, Truck, Shield,
  Award, Clock, ChevronRight, ChevronLeft, Zap, Package
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    orderId: ''
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      fetchRelatedProducts();
      checkWishlistStatus();
      trackView();
    }
  }, [id, user, token]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setProduct(data.product);
        // Initialize variations
        if (data.product.variations) {
          const initialVariations = {};
          data.product.variations.forEach(variation => {
            if (variation.options.length > 0) {
              initialVariations[variation.type] = variation.options[0];
            }
          });
          setSelectedVariations(initialVariations);
        }
      } else {
        setError(data.message || "Product not found");
      }
    } catch (err) {
      setError("Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}/related`);
      const data = await res.json();
      if (data.success) {
        setRelatedProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !token) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/wishlist/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const wishlistIds = data.products.map(item => item.product._id);
        setIsInWishlist(wishlistIds.includes(id));
      }
    } catch (err) {
      console.error("Error checking wishlist:", err);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}/view`, {
        method: 'POST'
      });
    } catch (err) {
      console.error("Error tracking view:", err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || !token) {
      setToastMessage("Please login to add items to wishlist");
      setToastType("error");
      return;
    }

    try {
      const method = isInWishlist ? 'DELETE' : 'POST';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}/wishlist`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setIsInWishlist(!isInWishlist);
        setToastMessage(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
        setToastType("success");
      }
    } catch (err) {
      setToastMessage("Error updating wishlist");
      setToastType("error");
    }
  };

  const handleVariationChange = (type, option) => {
    setSelectedVariations(prev => ({
      ...prev,
      [type]: option
    }));
  };

  const calculateFinalPrice = () => {
    let basePrice = product.price;
    
    // Apply discount
    if (product.discount > 0) {
      basePrice = basePrice * (1 - product.discount / 100);
    }
    
    // Apply variation price adjustments
    Object.values(selectedVariations).forEach(option => {
      basePrice += option.priceAdjustment || 0;
    });
    
    return Math.round(basePrice);
  };

  const handleAddToCart = () => {
    const productWithVariations = {
      ...product,
      finalPrice: calculateFinalPrice()
    };
    
    // Convert selectedVariations object to array format expected by backend
    const variationsArray = Object.entries(selectedVariations).map(([type, value]) => ({
      type,
      value
    }));
    
    addToCart(productWithVariations, quantity, variationsArray);
    setToastMessage(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
    setToastType("success");
    setQuantity(1);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setToastMessage("Please login to submit a review");
      setToastType("error");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id,
          ...reviewForm
        })
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage("Review submitted successfully!");
        setToastType("success");
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', comment: '', orderId: '' });
        fetchReviews();
        fetchProduct(); // Refresh to update ratings
      } else {
        setToastMessage(data.message || "Error submitting review");
        setToastType("error");
      }
    } catch (err) {
      setToastMessage("Error submitting review");
      setToastType("error");
    }
  };

  const renderStars = (rating, size = 16, interactive = false, onRatingChange = null) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={size}
        className={`${index < Math.floor(rating) ? 'text-warning' : 'text-muted'} ${interactive ? 'cursor-pointer' : ''}`}
        fill={index < Math.floor(rating) ? 'currentColor' : 'none'}
        onClick={interactive ? () => onRatingChange?.(index + 1) : undefined}
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

  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className={isDarkMode ? 'text-light' : 'text-muted'}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="text-center">
          <Package size={64} className="text-muted mb-3" />
          <h4 className="text-danger fw-semibold mb-3">{error || "Product not found"}</h4>
          <button onClick={() => navigate(-1)} className="btn btn-outline-primary">
            <ArrowLeft size={16} className="me-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none">Products</Link>
            </li>
            {product.category && (
              <li className="breadcrumb-item">
                <Link to={`/products?categories=${product.category._id}`} className="text-decoration-none">
                  {product.category.name}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''} mb-4`}>
          <div className="card-body p-4">
            <div className="row g-4">
              {/* Product Images */}
              <div className="col-lg-6">
                <div className="position-sticky" style={{ top: "100px" }}>
                  {/* Main Image */}
                  <div className="position-relative mb-3">
                    <img
                      src={product.images?.[selectedImageIndex] || "https://via.placeholder.com/600x500/f8f9fa/6c757d?text=No+Image"}
                      alt={product.name}
                      className="img-fluid rounded w-100"
                      style={{ height: "500px", objectFit: "cover" }}
                    />
                    
                    {/* Image Navigation */}
                    {product.images?.length > 1 && (
                      <>
                        <button 
                          className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2"
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === 0 ? product.images.length - 1 : prev - 1
                          )}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button 
                          className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2"
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === product.images.length - 1 ? 0 : prev + 1
                          )}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    {/* Badges */}
                    <div className="position-absolute top-0 start-0 m-3">
                      {product.isFeatured && (
                        <span className="badge bg-primary me-2">
                          <Award size={12} className="me-1" />
                          Featured
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="badge bg-danger">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Images */}
                  {product.images && product.images.length > 1 && (
                    <div className="d-flex gap-2 overflow-auto">
                      {product.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className={`img-thumbnail cursor-pointer ${
                            selectedImageIndex === index ? 'border-primary border-3' : ''
                          }`}
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Information */}
              <div className="col-lg-6">
                {/* Product Title and Category */}
                <div className="mb-3">
                  {product.brand && product.brand !== 'Unknown' && (
                    <span className="text-muted small d-block mb-1">
                      Brand: {product.brand}
                    </span>
                  )}
                  <h1 className={`h2 fw-bold mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                    {product.name}
                  </h1>
                  {product.category && (
                    <Link 
                      to={`/products?categories=${product.category._id}`}
                      className="badge bg-light text-primary text-decoration-none border"
                    >
                      {product.category.name}
                    </Link>
                  )}
                </div>

                {/* Rating */}
                <div className="d-flex align-items-center mb-3">
                  {product.ratings?.average > 0 ? (
                    <>
                      <div className="d-flex me-2">
                        {renderStars(product.ratings.average)}
                      </div>
                      <span className="fw-medium me-2">
                        {product.ratings.average}
                      </span>
                      <span className="text-muted">
                        ({product.ratings.count} reviews)
                      </span>
                      <button 
                        className="btn btn-link btn-sm p-0 ms-3"
                        onClick={() => setActiveTab('reviews')}
                      >
                        See all reviews
                      </button>
                    </>
                  ) : (
                    <span className="text-muted">No reviews yet</span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <span className="h3 text-primary fw-bold mb-0">
                      {formatPrice(finalPrice)}
                    </span>
                    {product.discount > 0 && (
                      <>
                        <span className="h5 text-muted text-decoration-line-through mb-0">
                          {formatPrice(product.price)}
                        </span>
                        <span className="badge bg-danger fs-6">
                          Save {formatPrice(product.price - finalPrice)}
                        </span>
                      </>
                    )}
                  </div>
                  <small className="text-muted">Inclusive of all taxes</small>
                </div>

                {/* Product Variations */}
                {product.variations?.map(variation => (
                  <div key={variation.type} className="mb-4">
                    <h6 className="fw-semibold mb-2">
                      {variation.type.charAt(0).toUpperCase() + variation.type.slice(1)}:
                      <span className="fw-normal ms-2">
                        {selectedVariations[variation.type]?.name}
                      </span>
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {variation.options.map(option => (
                        <button
                          key={option.name}
                          className={`btn btn-sm ${
                            selectedVariations[variation.type]?.name === option.name
                              ? 'btn-primary'
                              : 'btn-outline-secondary'
                          }`}
                          onClick={() => handleVariationChange(variation.type, option)}
                        >
                          {option.name}
                          {option.priceAdjustment > 0 && (
                            <small className="ms-1">+{formatPrice(option.priceAdjustment)}</small>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Stock Status */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                    {product.stock > 0 && product.stock < 10 && (
                      <span className="badge bg-warning">Only {product.stock} left!</span>
                    )}
                  </div>
                  {product.stock > 0 && (
                    <div className="progress mb-2" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Quantity and Actions */}
                <div className="row align-items-end mb-4">
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold">Quantity:</label>
                    <div className="input-group">
                      <button 
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus size={16} />
                      </button>
                      <input 
                        type="number" 
                        className="form-control text-center"
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setQuantity(Math.max(1, Math.min(product.stock, value)));
                        }}
                        min="1"
                        max={product.stock}
                      />
                      <button 
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-8">
                    <div className="d-grid gap-2">
                      <button
                        onClick={handleAddToCart}
                        className="btn btn-primary btn-lg fw-semibold"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart size={18} className="me-2" />
                        Add to Cart
                      </button>
                      
                      <div className="d-flex gap-2">
                        <button
                          onClick={handleWishlistToggle}
                          className={`btn flex-fill ${
                            isInWishlist ? 'btn-danger' : 'btn-outline-danger'
                          }`}
                        >
                          <Heart 
                            size={16} 
                            className="me-1"
                            fill={isInWishlist ? 'currentColor' : 'none'}
                          />
                          {isInWishlist ? 'Wishlisted' : 'Wishlist'}
                        </button>
                        
                        <button className="btn btn-outline-secondary">
                          <Share size={16} />
                        </button>
                        
                        <button 
                          onClick={() => navigate(-1)} 
                          className="btn btn-outline-dark"
                        >
                          <ArrowLeft size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery & Service Info */}
                <div className={`border rounded p-3 ${isDarkMode ? 'border-secondary' : ''}`}>
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <Truck size={16} className="text-success me-2" />
                        <span>Free delivery on orders above ₹500</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <Shield size={16} className="text-info me-2" />
                        <span>1 year warranty included</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <Clock size={16} className="text-warning me-2" />
                        <span>Standard delivery: 3-5 days</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <Zap size={16} className="text-primary me-2" />
                        <span>Express delivery available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''} mb-4`}>
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({reviews.length})
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body">
            {activeTab === 'description' && (
              <div>
                <h5 className="fw-semibold mb-3">Product Description</h5>
                <p className="lh-lg">
                  {product.description || "No description available for this product."}
                </p>
                
                <div className="row mt-4">
                  <div className="col-md-6">
                    <h6 className="fw-semibold">Product Details</h6>
                    <ul className="list-unstyled">
                      <li><strong>Product ID:</strong> {product._id.slice(-6).toUpperCase()}</li>
                      <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
                      <li><strong>Category:</strong> {product.category?.name || 'N/A'}</li>
                      {product.tags?.length > 0 && (
                        <li>
                          <strong>Tags:</strong> {product.tags.join(', ')}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-semibold">Specifications</h6>
                    <ul className="list-unstyled">
                      <li><strong>Views:</strong> {product.views || 0}</li>
                      <li><strong>Sales:</strong> {product.sales || 0} units sold</li>
                      <li><strong>Listed:</strong> {new Date(product.createdAt).toLocaleDateString()}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-semibold mb-0">Customer Reviews</h5>
                  {user && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Review Form Modal */}
                {showReviewForm && (
                  <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                      <div className={`modal-content ${isDarkMode ? 'bg-dark text-light' : ''}`}>
                        <div className="modal-header">
                          <h5 className="modal-title">Write a Review</h5>
                          <button 
                            type="button" 
                            className="btn-close"
                            onClick={() => setShowReviewForm(false)}
                          ></button>
                        </div>
                        <form onSubmit={submitReview}>
                          <div className="modal-body">
                            <div className="mb-3">
                              <label className="form-label">Rating</label>
                              <div className="d-flex gap-1">
                                {renderStars(reviewForm.rating, 24, true, (rating) => 
                                  setReviewForm(prev => ({ ...prev, rating }))
                                )}
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Title</label>
                              <input
                                type="text"
                                className="form-control"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Brief title for your review"
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Comment</label>
                              <textarea
                                className="form-control"
                                rows="4"
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your experience with this product"
                                required
                              ></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Order ID (optional)</label>
                              <input
                                type="text"
                                className="form-control"
                                value={reviewForm.orderId}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, orderId: e.target.value }))}
                                placeholder="Your order ID for verification"
                              />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button 
                              type="button" 
                              className="btn btn-secondary"
                              onClick={() => setShowReviewForm(false)}
                            >
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                              Submit Review
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review._id} className={`border rounded p-3 mb-3 ${isDarkMode ? 'border-secondary' : ''}`}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <strong>{review.user?.name || 'Anonymous'}</strong>
                              <div className="d-flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <small className="text-muted">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        {review.title && (
                          <h6 className="fw-semibold mb-2">{review.title}</h6>
                        )}
                        <p className="mb-2">{review.comment}</p>
                        {review.verified && (
                          <span className="badge bg-success small">
                            <Award size={12} className="me-1" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageCircle size={48} className="text-muted mb-3" />
                    <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header">
              <h5 className="mb-0">You Might Also Like</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {relatedProducts.slice(0, 4).map(relatedProduct => (
                  <div key={relatedProduct._id} className="col-md-6 col-lg-3">
                    <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
                      <Link to={`/products/${relatedProduct._id}`}>
                        <img
                          src={relatedProduct.images?.[0] || "https://via.placeholder.com/200x150"}
                          alt={relatedProduct.name}
                          className="card-img-top"
                          style={{ height: "150px", objectFit: "cover" }}
                        />
                      </Link>
                      <div className="card-body p-3">
                        <Link 
                          to={`/products/${relatedProduct._id}`}
                          className="text-decoration-none"
                        >
                          <h6 className={`card-title small ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                            {relatedProduct.name}
                          </h6>
                        </Link>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-bold text-primary">
                            {formatPrice(relatedProduct.price)}
                          </span>
                          {relatedProduct.ratings?.average > 0 && (
                            <div className="d-flex align-items-center">
                              <Star size={12} className="text-warning me-1" fill="currentColor" />
                              <small>{relatedProduct.ratings.average}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Toast 
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
};

export default ProductDetails;
