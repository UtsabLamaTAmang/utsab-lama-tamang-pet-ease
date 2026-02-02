import express from "express";
import { getPublicProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id/public-profile", protect, getPublicProfile);

export default router;
