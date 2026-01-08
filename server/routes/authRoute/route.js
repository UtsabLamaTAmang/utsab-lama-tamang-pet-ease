import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  verifyOTP,
  resendOTP,
} from "../../controllers/authController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.get("/me", authMiddleware, getMe);
router.put("/update-profile", authMiddleware, updateProfile);

export default router;
