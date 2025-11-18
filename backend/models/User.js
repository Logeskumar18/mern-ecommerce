import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.googleId; } }, // Password not required for Google users
    phone: { type: String },
    address: { type: String },
    role: {
      type: String,
      enum: ["customer", "admin", "seller"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    avatar: { type: String }, // Profile picture URL
    googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
