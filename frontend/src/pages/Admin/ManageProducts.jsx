import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, Save, X, Upload, Eye } from "lucide-react";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    discount: "",
    isFeatured: false
  });
  const [imageFiles, setImageFiles] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`);
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage("❌ Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Handle numeric fields to prevent NaN
    if ((name === 'price' || name === 'stock' || name === 'discount') && type === 'number') {
      // Allow empty string, will be converted to 0 on submit
      processedValue = value === '' ? '' : value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      discount: "",
      isFeatured: false
    });
    setImageFiles([]);
    setEditingId(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Add form fields with proper validation
    Object.keys(formData).forEach(key => {
      let value = formData[key];
      
      // Handle numeric fields properly
      if (key === 'price' || key === 'stock' || key === 'discount') {
        value = value === '' || value === null || value === undefined ? '0' : value.toString();
      }
      
      formDataToSend.append(key, value);
    });
    
    // Add image files
    imageFiles.forEach(file => {
      formDataToSend.append('images', file);
    });

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${import.meta.env.VITE_API_BASE_URL}/api/products/${editingId}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/products`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(editingId ? "✅ Product updated successfully!" : "✅ Product added successfully!");
        resetForm();
        fetchProducts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.message || 'Failed to save product'}`);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setMessage("❌ Server error - please try again");
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category?._id || "",
      stock: product.stock || "",
      discount: product.discount || "",
      isFeatured: product.isFeatured || false
    });
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (res.ok) {
        setMessage("🗑️ Product deleted successfully!");
        fetchProducts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage("❌ Server error");
    }
  };

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?._id === selectedCategory)
    : products;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">
          <i className="fas fa-box-open me-3 text-primary"></i>
          Manage Products
        </h1>
        <button 
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle className="me-2" style={{ width: '18px', height: '18px' }} />
          Add New Product
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible`}>
          {message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="Product description"
                  ></textarea>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    onBlur={(e) => {
                      // Ensure positive value
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 0) {
                        setFormData(prev => ({ ...prev, price: '0' }));
                      }
                    }}
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Stock Reference</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="0"
                    min="0"
                    onBlur={(e) => {
                      // Ensure non-negative value
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 0) {
                        setFormData(prev => ({ ...prev, stock: '0' }));
                      }
                    }}
                  />
                  <small className="text-muted">For admin reference - customers can order any quantity</small>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                    onBlur={(e) => {
                      // Ensure valid range on blur
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 0) {
                        setFormData(prev => ({ ...prev, discount: '0' }));
                      } else if (value > 100) {
                        setFormData(prev => ({ ...prev, discount: '100' }));
                      }
                    }}
                  />
                  <small className="text-muted">Enter value between 0-100%</small>
                </div>
                
                <div className="col-md-3 d-flex align-items-center">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="form-check-input"
                      id="featuredCheck"
                    />
                    <label className="form-check-label fw-semibold" htmlFor="featuredCheck">
                      Featured Product
                    </label>
                  </div>
                </div>
                
                <div className="col-12">
                  <label className="form-label fw-semibold">Product Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control"
                  />
                  <small className="text-muted">You can select multiple images</small>
                </div>
              </div>
              
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-success d-flex align-items-center">
                  <Save className="me-2" style={{ width: '16px', height: '16px' }} />
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn btn-outline-secondary d-flex align-items-center"
                >
                  <X className="me-2" style={{ width: '16px', height: '16px' }} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-8 text-end">
              <button 
                className="btn btn-outline-primary"
                onClick={fetchProducts}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Products List ({filteredProducts.length} items)</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center p-4">
              <i className="fas fa-box-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted">No products found</h5>
              <p className="text-muted">Add your first product to get started</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th style={{ width: '80px' }}>Image</th>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={product.images?.[0] || "https://via.placeholder.com/60x60/f8f9fa/6c757d?text=No+Image"}
                          alt={product.name}
                          className="img-thumbnail"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>
                        <div>
                          <strong>{product.name}</strong>
                          {product.isFeatured && (
                            <span className="badge bg-warning text-dark ms-2">Featured</span>
                          )}
                          {product.discount > 0 && (
                            <span className="badge bg-danger ms-2">-{product.discount}%</span>
                          )}
                          <br />
                          <small className="text-muted">
                            {product.description?.substring(0, 50)}...
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {product.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <strong className="text-primary">₹{product.price}</strong>
                        {product.discount > 0 && (
                          <div>
                            <small className="text-success">
                              Save ₹{Math.round(product.price * product.discount / 100)}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-secondary'}`}>
                          {product.stock > 0 ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(product)}
                            title="Edit product"
                          >
                            <Edit style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(product._id)}
                            title="Delete product"
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
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
    </div>
  );
};

export default ManageProducts;
