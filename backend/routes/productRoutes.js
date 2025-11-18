import express from "express";
import upload from "../middleware/upload.js";
import { 
  createProduct, 
  getProducts, 
  getProductsByCategory, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  addProductReview,
  getProductReviews,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getRelatedProducts,
  trackProductView
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Product CRUD
router.post("/", protect, authorizeRoles("admin", "manager"), upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.put("/:id", protect, authorizeRoles("admin", "manager"), upload.array("images", 5), updateProduct);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteProduct);

// Reviews
router.post("/:productId/reviews", protect, addProductReview);
router.get("/:productId/reviews", getProductReviews);

// Wishlist
router.post("/:productId/wishlist", protect, addToWishlist);
router.delete("/:productId/wishlist", protect, removeFromWishlist);
router.get("/wishlist/user", protect, getWishlist);

// Related products
router.get("/:productId/related", getRelatedProducts);

// Track views
router.post("/:productId/view", trackProductView);

export default router;
