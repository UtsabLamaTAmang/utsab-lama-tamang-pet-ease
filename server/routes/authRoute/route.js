import express from "express";
import {
  register,
  registerRescuer,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyOTP,
  resendOTP,
} from "../../controllers/authController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-rescuer", registerRescuer);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.get("/me", authMiddleware, getMe);
router.put("/update-profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
