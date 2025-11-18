import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OTPVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // handle input for each OTP box
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // only digits allowed
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next box automatically
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // join OTP and send to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpValue }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ OTP Verified Successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.message || "Invalid OTP. Try again.");
      }
    } catch (err) {
      setError("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(to right, #4f46e5, #8b5cf6, #ec4899)" }}
    >
      <div className="card shadow-lg p-4 p-md-5 rounded-4 text-center" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-primary fw-bold mb-2">OTP Verification</h2>
        <p className="text-secondary mb-4">Enter the 6-digit code sent to your email</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-center gap-2 mb-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="form-control text-center fs-4 fw-bold"
                style={{ width: "3rem", height: "3rem" }}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="text-secondary mt-3 mb-0 small">
          Didn’t receive the code?{" "}
          <button
            onClick={() => window.location.reload()}
            className="btn btn-link p-0 text-primary fw-semibold"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerify;
