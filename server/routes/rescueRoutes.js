import express from "express";
import {
    reportRescue,
    getRescueReports,
    getRescueReportById,
    getAvailableReports,
    acceptMission,
    getMyMissions,
    completeMission,
    createRescueMission,
    updateRescueMissionStatus,
    getRescueMissions,
    getUserBadges,
    seedBadges,
    getRescuerStats,
} from "../controllers/rescueController.js";
import { protect, admin, rescuer } from "../middleware/authMiddleware.js";

const router = express.Router();

// User: submit & view own reports
router.post("/reports", protect, reportRescue);
router.get("/reports", protect, getRescueReports);
router.get("/reports/available", protect, getAvailableReports);
router.get("/reports/:id", protect, getRescueReportById);

// Rescuer: missions
router.post("/reports/:id/accept", protect, rescuer, acceptMission);
router.get("/missions/mine", protect, rescuer, getMyMissions);
router.patch("/missions/:id/complete", protect, rescuer, completeMission);
router.get("/rescuer/stats", protect, rescuer, getRescuerStats);

// Badges
router.get("/badges", protect, getUserBadges);
router.post("/badges/seed", protect, admin, seedBadges);

// Admin: manage missions
router.post("/missions", protect, admin, createRescueMission);
router.get("/missions", protect, admin, getRescueMissions);
router.patch("/missions/:id/status", protect, admin, updateRescueMissionStatus);

export default router;
