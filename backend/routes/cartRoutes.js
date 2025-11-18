import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getCart,
  addToCart, 
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} from "../controllers/cartController.js";

const router = express.Router();

// Cart operations
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.post("/sync", protect, syncCart);
router.put("/item/:itemId", protect, updateCartItem);
router.delete("/item/:itemId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

export default router;
