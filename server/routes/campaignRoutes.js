import express from "express";
import {
    getAllCampaigns,
    getCampaignById,
    getCampaignDetails,
    donateToCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
} from "../controllers/campaignController.js";
import { authMiddleware, admin as isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCampaigns);
router.get("/:id/details", getCampaignDetails);       // Campaign detail with donor stats
router.get("/:id", getCampaignById);

// User routes (authenticated)
router.post("/:id/donate", authMiddleware, donateToCampaign);  // Initiate eSewa donation

// Admin routes
router.post("/", authMiddleware, isAdmin, createCampaign);
router.put("/:id", authMiddleware, isAdmin, updateCampaign);
router.delete("/:id", authMiddleware, isAdmin, deleteCampaign);

export default router;
