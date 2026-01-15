import express from "express";
import {
    getAllPets,
    getPetById,
    createPet,
    updatePet,
    deletePet,
    approvePet,
} from "../controllers/petController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllPets);
router.get("/:id", getPetById);

// Protected routes
router.post("/", protect, createPet);
router.put("/:id", protect, updatePet);
router.delete("/:id", protect, deletePet);

// Admin only
router.patch("/:id/approve", protect, admin, approvePet);

export default router;
