import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { 
  getDailySales, 
  getTopProducts, 
  getDashboardStats, 
  getCategorySales, 
  getMonthlyRevenue 
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/daily-sales", protect, adminOnly, getDailySales);
router.get("/top-products", protect, adminOnly, getTopProducts);
router.get("/dashboard-stats", protect, adminOnly, getDashboardStats);
router.get("/category-sales", protect, adminOnly, getCategorySales);
router.get("/monthly-revenue", protect, adminOnly, getMonthlyRevenue);

export default router;
