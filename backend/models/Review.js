import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", 
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // Only allow reviews for purchased products
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    verified: {
      type: Boolean,
      default: false, // Admin can verify reviews
    },
    helpful: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isHelpful: { type: Boolean }
    }],
    images: [{ type: String }], // Allow users to upload images with reviews
  },
  { timestamps: true }
);

// Ensure a user can only review a product once per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);