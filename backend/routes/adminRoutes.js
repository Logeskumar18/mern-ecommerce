import express from "express";
import {
  getAllUsers,
  toggleBlockUser,
  getDashboardStats,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only Admins can access these routes
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id/block", protect, authorizeRoles("admin"), toggleBlockUser);
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardStats);

export default router;
