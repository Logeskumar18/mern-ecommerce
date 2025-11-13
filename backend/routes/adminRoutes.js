import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getDashboardData,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardData);
router.get("/orders", protect, adminOnly, getAllOrders);
router.put("/orders/:id", protect, adminOnly, updateOrderStatus);

export default router;
