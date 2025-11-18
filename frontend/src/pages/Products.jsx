import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  Search, Filter, Heart, Star, ShoppingCart, Eye, 
  Grid, List, ChevronDown, ChevronUp, SlidersHorizontal,
  Package, Zap, Award, TrendingUp
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    categories: [],
    minPrice: "",
    maxPrice: "", 
    brands: [],
    minRating: "",
    inStock: "",
    sort: "newest"
  });
  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    priceRange: { minPrice: 0, maxPrice: 10000 }
  });
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });

  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (user && token) {
      fetchWishlist();
    }
  }, [filters, user, token]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.brands.length > 0) params.append('brands', filters.brands.join(','));
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.inStock) params.append('inStock', filters.inStock);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', pagination.currentPage);
      params.append('limit', '12');

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.products || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalProducts: data.totalProducts || 0
        });
        if (data.filters) {
          setAvailableFilters(data.filters);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/wishlist/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.products.map(item => item.product._id));
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const handleWishlistToggle = async (productId) => {
    if (!user || !token) {
      alert("Please login to add items to wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.includes(productId);
      const method = isInWishlist ? 'DELETE' : 'POST';
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}/wishlist`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        if (isInWishlist) {
          setWishlist(prev => prev.filter(id => id !== productId));
        } else {
          setWishlist(prev => [...prev, productId]);
        }
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleBrandToggle = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categories: [],
      minPrice: "",
      maxPrice: "",
      brands: [],
      minRating: "",
      inStock: "",
      sort: "newest"
    });
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

  const ProductCard = ({ product }) => (
    <div className={`card h-100 shadow-sm ${isDarkMode ? 'bg-dark border-secondary text-light' : ''}`}>
      <div className="position-relative">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0] || "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image"}
            alt={product.name}
            className="card-img-top"
            style={{ height: "220px", objectFit: "cover" }}
          />
        </Link>
        
        {/* Wishlist Heart */}
        <button
          onClick={() => handleWishlistToggle(product._id)}
          className={`btn position-absolute top-0 end-0 m-2 ${
            wishlist.includes(product._id) ? 'btn-danger' : 'btn-light'
          }`}
          style={{ zIndex: 1 }}
        >
          <Heart 
            size={16} 
            fill={wishlist.includes(product._id) ? 'currentColor' : 'none'}
          />
        </button>

        {/* Badges */}
        <div className="position-absolute top-0 start-0 m-2">
          {product.isFeatured && (
            <span className="badge bg-primary mb-1 d-block">
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

      <div className="card-body d-flex flex-column">
        <div className="flex-grow-1">
          <Link to={`/products/${product._id}`} className="text-decoration-none">
            <h6 className={`card-title ${isDarkMode ? 'text-light' : 'text-dark'}`}>
              {product.name}
            </h6>
          </Link>
          
          <div className="d-flex align-items-center mb-2">
            {product.ratings?.average > 0 ? (
              <>
                <div className="d-flex me-2">
                  {renderStars(product.ratings.average)}
                </div>
                <small className="text-muted">
                  {product.ratings.average} ({product.ratings.count})
                </small>
              </>
            ) : (
              <small className="text-muted">No reviews yet</small>
            )}
          </div>

          {product.brand && product.brand !== 'Unknown' && (
            <small className="text-muted d-block mb-2">
              Brand: {product.brand}
            </small>
          )}

          <p className="card-text text-muted small" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              {product.discount > 0 ? (
                <>
                  <span className="fw-bold text-primary fs-6">
                    {formatPrice(product.price * (1 - product.discount / 100))}
                  </span>
                  <small className="text-muted text-decoration-line-through ms-2">
                    {formatPrice(product.price)}
                  </small>
                </>
              ) : (
                <span className="fw-bold text-primary fs-6">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <small className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </small>
          </div>
          
          <div className="d-grid gap-2">
            <div className="btn-group">
              <Link 
                to={`/products/${product._id}`}
                className="btn btn-outline-primary btn-sm"
              >
                <Eye size={14} className="me-1" />
                View
              </Link>
              <button
                onClick={() => addToCart(product)}
                className="btn btn-primary btn-sm"
                disabled={product.stock === 0}
              >
                <ShoppingCart size={14} className="me-1" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h1 className={`h3 mb-1 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                  All Products
                </h1>
                <p className="text-muted mb-0">
                  {pagination.totalProducts} products found
                </p>
              </div>
              
              <div className="d-flex gap-2 align-items-center">
                {/* View Mode Toggle */}
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

                {/* Filter Toggle */}
                <button
                  className="btn btn-outline-secondary btn-sm d-lg-none"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="row mb-3">
              <div className="col-lg-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products, brands, categories..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Filters Sidebar */}
          <div className={`col-lg-3 ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
            <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''} sticky-top`}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <Filter size={16} className="me-2" />
                  Filters
                </h6>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>
              <div className="card-body">
                {/* Categories */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">Categories</h6>
                  <div className="max-h-200px overflow-auto">
                    {categories.map(category => (
                      <div key={category._id} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={filters.categories.includes(category._id)}
                          onChange={() => handleCategoryToggle(category._id)}
                          id={`cat-${category._id}`}
                        />
                        <label className="form-check-label" htmlFor={`cat-${category._id}`}>
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">Price Range</h6>
                  <div className="row">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <small className="text-muted">
                    Range: {formatPrice(availableFilters.priceRange?.minPrice || 0)} - {formatPrice(availableFilters.priceRange?.maxPrice || 10000)}
                  </small>
                </div>

                {/* Brands */}
                {availableFilters.brands?.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-3">Brands</h6>
                    <div className="max-h-200px overflow-auto">
                      {availableFilters.brands.map(brand => (
                        <div key={brand} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                            id={`brand-${brand}`}
                          />
                          <label className="form-check-label" htmlFor={`brand-${brand}`}>
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">Rating</h6>
                  <select
                    className="form-select form-select-sm"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  >
                    <option value="">All Ratings</option>
                    <option value="4">4★ & above</option>
                    <option value="3">3★ & above</option>
                    <option value="2">2★ & above</option>
                    <option value="1">1★ & above</option>
                  </select>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">Availability</h6>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="stock"
                      checked={filters.inStock === "true"}
                      onChange={() => handleFilterChange('inStock', 'true')}
                      id="in-stock"
                    />
                    <label className="form-check-label" htmlFor="in-stock">
                      In Stock
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="stock"
                      checked={filters.inStock === "false"}
                      onChange={() => handleFilterChange('inStock', 'false')}
                      id="out-of-stock"
                    />
                    <label className="form-check-label" htmlFor="out-of-stock">
                      Out of Stock
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="stock"
                      checked={filters.inStock === ""}
                      onChange={() => handleFilterChange('inStock', '')}
                      id="all-stock"
                    />
                    <label className="form-check-label" htmlFor="all-stock">
                      All
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-lg-9">
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <Package size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No products found</h5>
                <p className="text-muted">Try adjusting your filters or search terms</p>
                <button 
                  className="btn btn-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'row g-4' : ''}>
                  {products.map(product => (
                    <div key={product._id} className={viewMode === 'grid' ? 'col-md-6 col-xl-4' : 'mb-3'}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <nav className="mt-5">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => {
                            setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                        const pageNum = Math.max(1, pagination.currentPage - 2) + index;
                        if (pageNum > pagination.totalPages) return null;
                        
                        return (
                          <li key={pageNum} className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => {
                                setPagination(prev => ({ ...prev, currentPage: pageNum }));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => {
                            setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
