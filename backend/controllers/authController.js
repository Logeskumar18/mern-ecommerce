import bcrypt from "bcrypt";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    // Check admin key (you should set this in environment variables)
    const validAdminKey = process.env.ADMIN_KEY || "ADMIN123";
    if (adminKey !== validAdminKey) {
      return res.status(401).json({ message: "Invalid admin key" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send Login OTP
export const sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email, type: "login" });

    // Create new OTP
    await Otp.create({
      email,
      otp: otpCode,
      expiresAt: otpExpiry,
      type: "login",
    });

    // Send OTP email
    const emailContent = `
      <h2>Login OTP</h2>
      <p>Your OTP for login is: <strong>${otpCode}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail(email, "Your Login OTP", emailContent);

    res.json({ message: "Login OTP sent to your email" });
  } catch (error) {
    console.error("Send Login OTP Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify Login OTP
export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({
      email,
      otp,
      type: "login",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Verify Login OTP Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Delete any existing reset codes for this email
    await Otp.deleteMany({ email, type: "reset" });

    // Create new reset code
    await Otp.create({
      email,
      otp: resetCode,
      expiresAt: resetExpiry,
      type: "reset",
    });

    // Send reset email
    const emailContent = `
      <h2>Password Reset Request</h2>
      <p>Your password reset code is: <strong>${resetCode}</strong></p>
      <p>This code will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail(email, "Password Reset Code", emailContent);

    res.json({ message: "Password reset code sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const otpRecord = await Otp.findOne({
      email,
      otp: resetCode,
      type: "reset",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Delete the used reset code
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name || user.name,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    ).select('-password');

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth Sign-In
export const googleSignIn = async (req, res) => {
  try {
    const { uid, email, name, photoURL, provider } = req.body;

    if (!uid || !email || !name) {
      return res.status(400).json({ message: "Missing required Google user data" });
    }

    // Check if user already exists with this email
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: uid }
      ]
    });

    if (user) {
      // User exists, update Google ID if not already set
      if (!user.googleId) {
        user.googleId = uid;
        user.avatar = photoURL || user.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        googleId: uid,
        name: name,
        email: email,
        avatar: photoURL,
        role: "customer",
        isEmailVerified: true, // Google emails are verified
        authProvider: provider || 'google'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Google sign-in successful",
      token: token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });

  } catch (error) {
    console.error("Google Sign-In Error:", error);
    res.status(500).json({ 
      message: "Failed to process Google sign-in",
      error: error.message 
    });
  }
};
