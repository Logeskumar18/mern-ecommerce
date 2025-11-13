import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload } from "lucide-react";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch {
      setMessage("❌ Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => setImages(Array.from(e.target.files));

  // Create or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    Object.keys(formData).forEach((key) => form.append(key, formData[key]));
    images.forEach((img) => form.append("images", img));

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        setMessage(editingId ? "✅ Product updated" : "✅ Product created");
        setFormData({ name: "", category: "", price: "", stock: "", description: "" });
        setImages([]);
        setEditingId(null);
        fetchProducts();
      } else {
        setMessage("❌ Operation failed");
      }
    } catch {
      setMessage("❌ Server error");
    }
  };

  // Edit a product
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
    });
    setEditingId(product._id);
    setImages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("🗑️ Product deleted");
        fetchProducts();
      } else {
        setMessage("❌ Failed to delete");
      }
    } catch {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="bg-light py-5" style={{ minHeight: "100vh" }}>
      <div className="container">
        <h1 className="text-center mb-5 fw-bold">Manage Products</h1>

        {message && <div className="alert alert-success text-center">{message}</div>}

        {/* Form Section */}
        <form className="card shadow-sm p-4 mb-5" onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <input
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <input
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <input
                name="stock"
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-12">
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows={3}
              />
            </div>
            <div className="col-12">
              <label className="form-label d-flex align-items-center gap-2 mb-2">
                <Upload size={16} /> Upload Images (max 5)
              </label>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            {editingId ? "Update Product" : "Add Product"}
          </button>
        </form>

        {/* Product List */}
        <div className="card shadow-sm p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 fw-semibold">Product List</h2>
            <button className="btn btn-outline-primary btn-sm" onClick={fetchProducts}>
              <Plus size={16} /> Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-center text-secondary">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-secondary">No products found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.images?.[0] || "/placeholder.jpg"}
                          alt={p.name}
                          className="img-thumbnail"
                          style={{ width: "60px", height: "60px", objectFit: "cover" }}
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>₹{p.price}</td>
                      <td>{p.stock}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(p)}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <Trash2 size={16} />
                        </button>
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
