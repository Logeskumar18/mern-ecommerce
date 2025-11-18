import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    
    // Enhanced fields for advanced filtering
    brand: { type: String, default: "Unknown" },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    reviews: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Product variations (size, color, etc.)
    variations: [{
      type: { type: String, required: true }, // 'size', 'color', etc.
      options: [{
        name: { type: String, required: true }, // 'Small', 'Red', etc.
        value: { type: String, required: true }, // 'S', '#FF0000', etc.
        priceAdjustment: { type: Number, default: 0 }, // Additional cost for this option
        stock: { type: Number, default: 0 }
      }]
    }],
    
    // SEO and additional metadata
    slug: { type: String, unique: true },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 }, // Track number of units sold
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
