import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Edit, RefreshCw } from "lucide-react";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
      else setMessage("❌ Failed to load categories");
    } catch {
      setMessage("❌ Server error while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create or update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `/api/categories/${editingId}`
      : "/api/categories";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setMessage(editingId ? "✅ Category updated" : "✅ Category added");
        setName("");
        setEditingId(null);
        fetchCategories();
      } else {
        setMessage("❌ Failed to save category");
      }
    } catch {
      setMessage("❌ Server error");
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditingId(category._id);
    setName(category.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("🗑️ Category deleted");
        fetchCategories();
      } else {
        setMessage("❌ Failed to delete category");
      }
    } catch {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Manage Categories</h1>

      {message && (
        <div className="alert alert-success text-center">{message}</div>
      )}

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="card mb-4 p-4 shadow-sm">
        <div className="row g-2 align-items-center">
          <div className="col">
            <input
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary d-flex align-items-center">
              <PlusCircle className="me-2" /> {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {/* Category List */}
      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Category List</h5>
          <button className="btn btn-outline-primary btn-sm d-flex align-items-center" onClick={fetchCategories}>
            <RefreshCw className="me-1" /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-center">No categories found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th className="text-start">Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat._id}>
                    <td>{index + 1}</td>
                    <td className="text-start">{cat.name}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => handleEdit(cat)}
                      >
                        <Edit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(cat._id)}
                      >
                        <Trash2 />
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
  );
};

export default ManageCategories;
