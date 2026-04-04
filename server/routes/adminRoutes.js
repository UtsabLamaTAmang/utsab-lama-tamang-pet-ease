import express from "express";
import {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    toggleUserStatus
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(protect, admin);

// Get dashboard stats
router.get("/dashboard-stats", getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", toggleUserStatus);

export default router;
