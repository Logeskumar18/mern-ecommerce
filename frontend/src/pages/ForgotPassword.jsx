import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset code sent! Redirecting to reset page...");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.message || "Failed to send reset email");
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
        background: "linear-gradient(to right, #f59e0b, #d97706, #b45309)",
      }}
    >
      <div
        className="card shadow-lg p-4 p-md-5 rounded-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center text-warning fw-bold mb-4">
          Forgot Password
        </h2>

        <p className="text-center text-muted mb-4">
          Enter your email address and we'll send you a link to reset your password.
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
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-warning w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <p className="mb-2">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-warning fw-semibold text-decoration-none"
            >
              Back to Login
            </Link>
          </p>
          <p className="mb-0">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-warning fw-semibold text-decoration-none"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
