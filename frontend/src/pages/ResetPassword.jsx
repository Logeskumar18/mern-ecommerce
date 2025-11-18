import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resetCode: formData.resetCode,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>Invalid Reset Link</h3>
          <p>Please use the reset link from your email.</p>
          <Link to="/forgot-password" className="btn btn-primary">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(to right, #dc3545, #c82333, #a02622)",
      }}
    >
      <div
        className="card shadow-lg p-4 p-md-5 rounded-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center text-danger fw-bold mb-4">
          Reset Password
        </h2>

        <p className="text-center text-muted mb-4">
          Enter the reset code sent to <strong>{email}</strong> and your new password.
        </p>

        {error && (
          <div className="alert alert-danger text-center py-2">
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success text-center py-2">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Reset Code */}
          <div className="mb-3">
            <label className="form-label">Reset Code</label>
            <input
              type="text"
              name="resetCode"
              className="form-control text-center"
              placeholder="Enter 6-digit code"
              value={formData.resetCode}
              onChange={handleChange}
              maxLength="6"
              style={{ letterSpacing: "0.3rem", fontSize: "1.1rem" }}
              required
            />
          </div>

          {/* New Password */}
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-control"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-danger w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-danger fw-semibold text-decoration-none"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;