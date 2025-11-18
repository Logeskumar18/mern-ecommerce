import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RegisterAdmin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.adminKey) {
      setError("Admin key is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminKey: formData.adminKey
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Auto-login after successful registration
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        };
        
        login(userData, data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Admin registration failed");
      }
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(to right, #dc2626, #991b1b, #7f1d1d)",
      }}
    >
      <div
        className="card shadow-lg p-4 p-md-5 rounded-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center text-danger fw-bold mb-4">
          Admin Registration
        </h2>

        {error && (
          <div className="alert alert-danger text-center py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* Admin Key */}
          <div className="mb-3">
            <label className="form-label">Admin Key</label>
            <input
              type="password"
              name="adminKey"
              className="form-control"
              placeholder="Enter admin access key"
              value={formData.adminKey}
              onChange={handleChange}
              required
            />
            <small className="text-muted">Contact system administrator for admin key</small>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-danger w-100" disabled={loading}>
            {loading ? "Creating Admin Account..." : "Register as Admin"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="mb-2">
            Already have an account?{" "}
            <Link to="/login" className="text-danger fw-semibold text-decoration-none">
              Login
            </Link>
          </p>
          <p className="mb-0">
            Want to register as Customer?{" "}
            <Link to="/register-customer" className="text-success fw-semibold text-decoration-none">
              Customer Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;