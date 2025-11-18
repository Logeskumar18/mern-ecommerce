import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Edit, RefreshCw, Eye, EyeOff, Upload, X, Search, Filter, ChevronDown, ChevronRight, Package } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ManageCategories = () => {
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parentCategory: "",
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const token = localStorage.getItem("token");

  // Fetch categories with product count
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/with-count?includeInactive=true`);
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
        // Set parent categories (categories without parent)
        setParentCategories(data.filter(cat => !cat.parentCategory));
      } else {
        setMessage({ type: "error", text: "Failed to load categories" });
      }
    } catch {
      setMessage({ type: "error", text: "Server error while fetching categories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size should be less than 5MB" });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      parentCategory: "",
      isActive: true
    });
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Category name is required" });
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${import.meta.env.VITE_API_BASE_URL}/api/categories/${editingId}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/categories`;

    try {
      // For now, we'll send the image URL directly. In production, you'd upload the file first.
      const submitData = {
        ...formData,
        image: imagePreview || formData.image
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        setMessage({ 
          type: "success", 
          text: editingId ? "Category updated successfully!" : "Category added successfully!" 
        });
        resetForm();
        fetchCategories();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || 'Failed to save category' });
      }
    } catch {
      setMessage({ type: "error", text: "Server error - please try again" });
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      parentCategory: category.parentCategory?._id || "",
      isActive: category.isActive
    });
    setImagePreview(category.image || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle category status
  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/${id}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Category status updated" });
        fetchCategories();
      } else {
        setMessage({ type: "error", text: "Failed to update status" });
      }
    } catch {
      setMessage({ type: "error", text: "Server error" });
    }
  };

  // Delete category
  const handleDelete = async (id, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "Category deleted successfully" });
        fetchCategories();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Failed to delete category" });
      }
    } catch {
      setMessage({ type: "error", text: "Server error" });
    }
  };

  // Toggle category expansion
  const toggleExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && cat.isActive) ||
                         (filterStatus === "inactive" && !cat.isActive);
    return matchesSearch && matchesFilter;
  });

  // Get subcategories
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentCategory?._id === parentId);
  };

  return (
    <div className={`container-fluid p-4 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className={`h3 mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Category Management</h1>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle size={20} />
          Add Category
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} alert-dismissible d-flex align-items-center`}>
          <div>{message.text}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setMessage("")}></button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className={`card mb-4 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
          <div className={`card-header d-flex justify-content-between align-items-center ${isDarkMode ? 'bg-secondary text-light' : 'bg-primary text-white'}`}>
            <h5 className="mb-0">{editingId ? 'Edit Category' : 'Add New Category'}</h5>
            <button className="btn btn-sm btn-outline-light" onClick={resetForm}>
              <X size={16} />
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Electronics, Fashion"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Parent Category</label>
                  <select 
                    className={`form-select ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    value={formData.parentCategory}
                    onChange={(e) => setFormData({...formData, parentCategory: e.target.value})}
                  >
                    <option value="">Select Parent Category (Optional)</option>
                    {parentCategories.filter(cat => cat._id !== editingId).map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    placeholder="Brief description of category"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    rows="2"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Status</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="categoryStatus"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="categoryStatus">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Category Image</label>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({...formData, image: e.target.value});
                          setImagePreview(e.target.value);
                        }}
                        className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      />
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="img-thumbnail"
                        style={{ maxHeight: '100px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                  <PlusCircle size={16} /> 
                  {editingId ? "Update Category" : "Add Category"}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-outline-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className={`card mb-4 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Search Categories</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Filter by Status</label>
              <select 
                className={`form-select ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={fetchCategories}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Categories ({filteredCategories.length})</h5>
          <span className="badge bg-primary">{categories.filter(c => c.isActive).length} Active</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center p-5">
              <Package size={48} className="text-muted mb-3" />
              <p className="text-muted">No categories found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className={`${isDarkMode ? 'table-dark' : 'table-light'}`}>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Parent</th>
                    <th style={{ width: '100px' }}>Products</th>
                    <th style={{ width: '80px' }}>Status</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat, index) => (
                    <tr key={cat._id} className={cat.isActive ? '' : 'table-secondary'}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {cat.image && (
                            <img 
                              src={cat.image} 
                              alt={cat.name}
                              className="rounded"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <strong>{cat.name}</strong>
                            {cat.slug && (
                              <div className="small text-muted">/{cat.slug}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {cat.description || 'No description'}
                        </span>
                      </td>
                      <td>
                        {cat.parentCategory ? (
                          <span className="badge bg-secondary">
                            {cat.parentCategory.name}
                          </span>
                        ) : (
                          <span className="text-muted small">Root</span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {cat.productCount || 0}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${cat.isActive ? 'btn-success' : 'btn-outline-secondary'}`}
                          onClick={() => toggleStatus(cat._id)}
                          title={`Click to ${cat.isActive ? 'deactivate' : 'activate'}`}
                        >
                          {cat.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(cat)}
                            title="Edit category"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(cat._id, cat.name)}
                            title="Delete category"
                            disabled={cat.productCount > 0}
                          >
                            <Trash2 size={14} />
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

export default ManageCategories;
