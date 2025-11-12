import express from "express";
import upload from "../middleware/upload.js";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "manager"), upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.put("/:id", protect, authorizeRoles("admin", "manager"),upload.array("images", 5), updateProduct);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteProduct);

export default router;
