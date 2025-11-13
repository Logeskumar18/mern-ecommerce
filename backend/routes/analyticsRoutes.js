import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getDailySales, getTopProducts } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/daily-sales", protect, adminOnly, getDailySales);
router.get("/top-products", protect, adminOnly, getTopProducts);

export default router;
