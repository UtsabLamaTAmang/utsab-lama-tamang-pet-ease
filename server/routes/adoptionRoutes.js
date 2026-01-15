import express from "express";
import {
    createAdoptionRequest,
    getAdoptionRequests,
    getAdoptionRequestById,
    updateAdoptionRequestStatus,
    cancelAdoptionRequest,
} from "../controllers/adoptionController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", protect, createAdoptionRequest);
router.get("/", protect, getAdoptionRequests);
router.get("/:id", protect, getAdoptionRequestById);
router.patch("/:id/cancel", protect, cancelAdoptionRequest);

// Admin only
router.patch("/:id/status", protect, updateAdoptionRequestStatus);

export default router;
