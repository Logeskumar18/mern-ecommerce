import express from "express";
import { 
  createCategory, 
  getCategories, 
  getCategoryById,
  getCategoryBySlug,
  getSubcategories,
  updateCategory, 
  deleteCategory,
  toggleCategoryStatus,
  getCategoriesWithProductCount
} from "../controllers/categoryController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/with-count", getCategoriesWithProductCount);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategoryById);
router.get("/:id/subcategories", getSubcategories);

// Protected routes (admin/manager only)
router.post("/", protect, authorizeRoles("admin", "manager"), createCategory);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateCategory);
router.patch("/:id/toggle-status", protect, authorizeRoles("admin", "manager"), toggleCategoryStatus);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteCategory);

export default router;
