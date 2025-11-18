import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const Login = () => {
  const { login } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {

        // Backend does NOT return data.user → so build user object manually
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
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In success
  const handleGoogleSuccess = async (userData, credential) => {
    setLoading(true);
    setError("");

    try {
      // Send Google user data to backend for authentication/registration
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL,
          provider: 'google'
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const userInfo = {
          _id: data._id || userData.uid,
          name: data.name || userData.name,
          email: data.email || userData.email,
          role: data.role || "customer",
          avatar: data.avatar || userData.photoURL
        };

        login(userInfo, data.token || 'mock_token_' + Date.now());
        
        // Redirect based on role
        if (userInfo.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Google sign-in failed");
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In error
  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(to right, #4f46e5, #8b5cf6, #ec4899)",
      }}
    >
      <div
        className={`card shadow-lg p-4 p-md-5 rounded-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className={`text-center fw-bold mb-4 ${isDarkMode ? 'text-light' : 'text-primary'}`}>Welcome Back</h2>

        {error && (
          <div className="alert alert-danger text-center py-2 d-flex align-items-center">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <div className="input-group">
              <span className={`input-group-text ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <span className={`input-group-text ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={`btn btn-outline-secondary ${isDarkMode ? 'border-secondary' : ''}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="text-center mb-3">
          <div className="d-flex align-items-center">
            <hr className="flex-grow-1" />
            <span className={`px-3 small ${isDarkMode ? 'text-light' : 'text-muted'}`}>OR</span>
            <hr className="flex-grow-1" />
          </div>
        </div>

        {/* Google Sign In */}
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          className="w-100 mb-3"
          disabled={loading}
        />

        <p className="text-center mt-3 mb-0">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary fw-semibold text-decoration-none"
          >
            Register
          </Link>
        </p>
        
        <div className="text-center mt-3">
          <Link
            to="/forgot-password"
            className="text-muted text-decoration-none me-3"
            style={{ fontSize: "0.9rem" }}
          >
            Forgot Password?
          </Link>
          <span className="text-muted">|</span>
          <Link
            to="/otp-login"
            className="text-info text-decoration-none ms-3"
            style={{ fontSize: "0.9rem" }}
          >
            Login with OTP
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
