import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { 
  placeOrder, 
  getUserOrders, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus, 
  getInvoiceData 
} from "../controllers/orderController.js";

const router = express.Router();

// Customer routes
router.post("/", protect, placeOrder);
router.get("/user/:userId", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.get("/:id/invoice", protect, getInvoiceData);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
