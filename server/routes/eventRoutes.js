import express from "express";
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelEventRegistration,
    getUserEventRegistrations,
} from "../controllers/eventController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected routes
router.post("/register", protect, registerForEvent);
router.get("/registrations/me", protect, getUserEventRegistrations);
router.patch("/registrations/:id/cancel", protect, cancelEventRegistration);

// Admin only
router.post("/", protect, admin, createEvent);
router.put("/:id", protect, admin, updateEvent);
router.delete("/:id", protect, admin, deleteEvent);

export default router;
