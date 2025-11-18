import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const { addToCart } = useContext(CartContext);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate minimum loading time for better UX
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 500));

        // Fetch featured products
        const featuredResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/products?featured=true`
        );
        
        if (!featuredResponse.ok) {
          throw new Error(`HTTP error! status: ${featuredResponse.status}`);
        }
        
        const featuredData = await featuredResponse.json();
        if (featuredData.success && featuredData.products) {
          setFeaturedProducts(featuredData.products);
        }

        // Fetch categories
        const categoriesResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/categories`
        );

        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
        }

        const categoriesData = await categoriesResponse.json();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);

          // Fetch products for each category (limited to 4 per category)
          const categoryProducts = {};
          for (const category of categoriesData.slice(0, 4)) {
            try {
              const productsResponse = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/products/category/${category._id}`
              );

              if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                if (productsData.success && productsData.products) {
                  categoryProducts[category._id] = {
                    category: category,
                    products: productsData.products.slice(0, 4),
                  };
                }
              }
            } catch (categoryErr) {
              console.warn(`Failed to fetch products for category ${category.name}:`, categoryErr);
            }
          }
          setProductsByCategory(categoryProducts);
        }

        // Wait for minimum loading time for better UX
        await minLoadingTime;
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle image loading states
  const handleImageLoad = (productId) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }));
  };

  const handleImageError = (productId) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }));
  };

  // Enhanced add to cart with animation feedback
  const handleAddToCart = (product) => {
    addToCart(product);
    
    // Add success animation to button
    const button = document.getElementById(`add-btn-${product._id}`);
    if (button) {
      button.classList.add('success-animation');
      setTimeout(() => {
        button.classList.remove('success-animation');
      }, 600);
    }
  };

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Enhanced Loading State */}
      {loading && (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-3">
              <div className="progress" style={{ width: '200px' }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: '75%' }}></div>
              </div>
            </div>
            <p className={`mt-3 ${isDarkMode ? 'text-light' : 'text-muted'}`}>Loading amazing products...</p>
          </div>
        </div>
      )}

      {/* Enhanced Error State */}
      {error && (
        <div className="container mt-5">
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-triangle me-3"></i>
            <div>
              <h5 className="alert-heading">Oops! Something went wrong</h5>
              <p className="mb-0">{error}</p>
              <hr />
              <button className="btn btn-outline-danger btn-sm" onClick={() => window.location.reload()}>
                <i className="fas fa-redo me-2"></i>Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Enhanced Hero Section */}
          <section className="text-white py-5 text-center position-relative overflow-hidden" style={{ 
            background: isDarkMode 
              ? "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)" 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            minHeight: "60vh",
            display: "flex",
            alignItems: "center"
          }}>
            {/* Animated Background Elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
              <div className="position-absolute animate__animated animate__fadeInUp animate__delay-1s" style={{
                top: '20%', left: '10%', fontSize: '4rem', color: 'rgba(255,255,255,0.1)'
              }}>
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="position-absolute animate__animated animate__fadeInUp animate__delay-2s" style={{
                top: '60%', right: '15%', fontSize: '3rem', color: 'rgba(255,255,255,0.1)'
              }}>
                <i className="fas fa-gift"></i>
              </div>
            </div>
            
            <div className="container position-relative z-1">
              <div className="animate__animated animate__fadeInDown">
                <h1 className="display-4 fw-bold mb-3 text-shadow">Welcome to MERN Shop</h1>
                <p className="lead mb-4 fs-5">Discover amazing products across all categories with great deals!</p>
              </div>
              <div className="d-flex gap-3 justify-content-center flex-wrap animate__animated animate__fadeInUp animate__delay-1s">
                <Link to="/products" className="btn btn-light btn-lg text-primary fw-semibold px-4 shadow-lg">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Shop Now
                </Link>
                <Link to="/products?featured=true" className="btn btn-outline-light btn-lg fw-semibold px-4">
                  <i className="fas fa-star me-2"></i>
                  Featured
                </Link>
              </div>
            </div>
          </section>

      {/* Categories Grid */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Shop by Category</h2>
            <p className="text-muted">Browse our wide range of product categories</p>
          </div>
          
          <div className="row g-4">
            {categories.map((category) => (
              <div key={category._id} className="col-6 col-md-4 col-lg-3">
                <Link
                  to={`/products?category=${category._id}`}
                  className="card h-100 text-center text-decoration-none shadow-sm category-card"
                  style={{ transition: "all 0.3s ease" }}
                >
                  <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: "60px", 
                        height: "60px",
                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                        color: "white"
                      }}
                    >
                      <i className="fas fa-box-open fa-lg"></i>
                    </div>
                    <h5 className="card-title mb-2 text-dark">{category.name}</h5>
                    <p className="card-text small text-muted">{category.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-5 bg-white">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="display-6 fw-bold mb-3">Featured Products</h2>
              <p className="text-muted">Hand-picked products just for you</p>
            </div>
            
            <div className="row g-4">
              {featuredProducts.slice(0, 8).map((product) => (
                <div key={product._id} className="col-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm product-card">
                    <div className="position-relative">
                      <Link to={`/products/${product._id}`}>
                        <img
                          src={product.images?.[0] || "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image"}
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
                        />
                      </Link>
                      {product.discount > 0 && (
                        <span 
                          className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded"
                          style={{ fontSize: "0.8rem" }}
                        >
                          -{product.discount}%
                        </span>
                      )}
                      <div className="position-absolute top-0 start-0 m-2">
                        <span className="badge bg-primary">Featured</span>
                      </div>
                    </div>
                    
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate">{product.name}</h5>
                      <p className="card-text small text-muted flex-grow-1">
                        {product.category?.name}
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          {product.discount > 0 ? (
                            <>
                              <span className="fw-bold text-primary">
                                ₹{Math.round(product.price * (1 - product.discount / 100))}
                              </span>
                              <small className="text-muted text-decoration-line-through ms-2">
                                ₹{product.price}
                              </small>
                            </>
                          ) : (
                            <span className="fw-bold text-primary">₹{product.price}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Link 
                          to={`/products/${product._id}`}
                          className="btn btn-outline-primary btn-sm flex-grow-1"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          className="btn btn-primary btn-sm flex-grow-1"
                        >
                          <i className="fas fa-cart-plus me-1"></i>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-5">
              <Link to="/products?featured=true" className="btn btn-outline-primary btn-lg">
                View All Featured Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Products by Category */}
      {Object.keys(productsByCategory).map((categoryId) => {
        const { category, products } = productsByCategory[categoryId];
        if (products.length === 0) return null;
        
        return (
          <section key={categoryId} className="py-5 bg-light">
            <div className="container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">{category.name}</h3>
                <Link 
                  to={`/products?category=${category._id}`}
                  className="btn btn-outline-primary"
                >
                  View All
                </Link>
              </div>
              
              <div className="row g-4">
                {products.map((product) => (
                  <div key={product._id} className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 shadow-sm product-card">
                      <Link to={`/products/${product._id}`}>
                        <img
                          src={product.images?.[0] || "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image"}
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
                        />
                      </Link>
                      
                      <div className="card-body d-flex flex-column">
                        <h6 className="card-title text-truncate">{product.name}</h6>
                        
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            {product.discount > 0 ? (
                              <div>
                                <span className="fw-bold text-primary">
                                  ₹{Math.round(product.price * (1 - product.discount / 100))}
                                </span>
                                <small className="text-muted text-decoration-line-through ms-1">
                                  ₹{product.price}
                                </small>
                              </div>
                            ) : (
                              <span className="fw-bold text-primary">₹{product.price}</span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => addToCart(product)}
                            className="btn btn-primary btn-sm w-100"
                          >
                            <i className="fas fa-cart-plus me-1"></i>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Newsletter Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h3 className="fw-bold mb-3">Stay Updated</h3>
          <p className="mb-4">Get notified about new products and special offers</p>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="input-group">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter your email"
                />
                <button className="btn btn-light text-primary fw-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
};

export default Home;
