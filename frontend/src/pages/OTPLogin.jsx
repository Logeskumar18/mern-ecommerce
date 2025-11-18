import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const OTPLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setStep(2);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        // Build user object
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        };

        // Save user & token to context + localStorage
        login(userData, data.token);

        // Redirect based on role
        if (userData.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setError("");
        alert("OTP sent successfully!");
      } else {
        setError(data.message || "Failed to resend OTP");
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
        background: "linear-gradient(to right, #06b6d4, #0891b2, #0e7490)",
      }}
    >
      <div
        className="card shadow-lg p-4 p-md-5 rounded-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center text-info fw-bold mb-4">
          Login with OTP
        </h2>

        {error && (
          <div className="alert alert-danger text-center py-2">
            {error}
          </div>
        )}

        {step === 1 ? (
          // Step 1: Email Input
          <>
            <p className="text-center text-muted mb-4">
              Enter your email address to receive login OTP
            </p>

            <form onSubmit={handleSendOTP}>
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

              <button
                type="submit"
                className="btn btn-info w-100 text-white"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          // Step 2: OTP Input
          <>
            <p className="text-center text-muted mb-4">
              Enter the 6-digit OTP sent to <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div className="mb-3">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  className="form-control text-center"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                  maxLength="6"
                  style={{ letterSpacing: "0.5rem", fontSize: "1.2rem" }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-info w-100 text-white mb-3"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="btn btn-outline-info w-100"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
            </form>

            <div className="text-center mt-3">
              <button
                className="btn btn-link p-0 text-muted"
                onClick={() => {
                  setStep(1);
                  setOTP("");
                  setOtpSent(false);
                }}
              >
                Change Email Address
              </button>
            </div>
          </>
        )}

        <div className="text-center mt-4">
          <p className="mb-2">
            Prefer password login?{" "}
            <Link
              to="/login"
              className="text-info fw-semibold text-decoration-none"
            >
              Login with Password
            </Link>
          </p>
          <p className="mb-0">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-info fw-semibold text-decoration-none"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;