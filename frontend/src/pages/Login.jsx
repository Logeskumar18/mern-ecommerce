import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);

        // ✅ Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin"); // admin dashboard route
        } else {
          navigate("/"); // normal user route
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(to right, #4f46e5, #8b5cf6, #ec4899)" }}>
      <div className="card shadow-lg p-4 p-md-5 rounded-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center text-primary fw-bold mb-4">Login</h2>

        {error && (
          <div className="alert alert-danger text-center py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don’t have an account?{" "}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
