import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // Assuming you have this

const router = express.Router();

// Get dashboard stats
// TODO: Add admin role check middleware if available
router.get("/stats", getDashboardStats);

export default router;
