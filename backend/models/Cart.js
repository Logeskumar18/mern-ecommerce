import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, default: 1, min: 1 },
      variations: [{
        type: { type: String }, // 'size', 'color', etc.
        option: {
          name: { type: String },
          value: { type: String },
          priceAdjustment: { type: Number, default: 0 }
        }
      }],
      priceAtTime: { type: Number, required: true }, // Price when added to cart
      addedAt: { type: Date, default: Date.now },
    },
  ],
  totalPrice: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Update lastUpdated on save
cartSchema.pre('save', function() {
  this.lastUpdated = Date.now();
});

// Ensure a user can only have one cart
cartSchema.index({ user: 1 }, { unique: true });

export default mongoose.model("Cart", cartSchema);
