import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "manager"), createCategory);

router.get("/", getCategories);

export default router;
