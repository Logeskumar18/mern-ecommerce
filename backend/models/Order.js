import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: "COD" }, // no payment gateway
  paymentStatus: { type: String, default: "Pending" },
  orderStatus: { type: String, default: "Processing" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
