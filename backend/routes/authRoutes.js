import express from "express";
import { 
  registerUser, 
  registerAdmin, 
  loginUser, 
  sendLoginOTP, 
  verifyLoginOTP, 
  forgotPassword, 
  resetPassword,
  updateProfile,
  getProfile,
  googleSignIn
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration routes
router.post("/register", registerUser);
router.post("/register-admin", registerAdmin);

// Login routes
router.post("/login", loginUser);
router.post("/send-login-otp", sendLoginOTP);
router.post("/verify-login-otp", verifyLoginOTP);

// Google OAuth
router.post("/google-signin", googleSignIn);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Profile routes (protected)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
