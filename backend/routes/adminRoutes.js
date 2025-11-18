import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getDashboardData,
  getAllUsers,
  updateUser,
  toggleBlockUser,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/adminController.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", protect, adminOnly, getDashboardData);

// User Management
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:userId", protect, adminOnly, updateUser);
router.patch("/users/:id/toggle-block", protect, adminOnly, toggleBlockUser);
router.delete("/users/:userId", protect, adminOnly, deleteUser);

// Order Management
router.get("/orders", protect, adminOnly, getAllOrders);
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
