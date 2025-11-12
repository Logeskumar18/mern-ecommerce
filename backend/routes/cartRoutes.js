import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addToCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", protect, addToCart);
// You can later add remove/update/get cart routes

export default router;
