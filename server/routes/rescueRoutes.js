import express from "express";
import {
    reportRescue,
    getRescueReports,
    getRescueReportById,
    createRescueMission,
    updateRescueMissionStatus,
    getRescueMissions,
} from "../controllers/rescueController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/reports", protect, reportRescue);
router.get("/reports", protect, getRescueReports);
router.get("/reports/:id", protect, getRescueReportById);

// Admin only
router.post("/missions", protect, admin, createRescueMission);
router.get("/missions", protect, admin, getRescueMissions);
router.patch("/missions/:id/status", protect, admin, updateRescueMissionStatus);

export default router;
