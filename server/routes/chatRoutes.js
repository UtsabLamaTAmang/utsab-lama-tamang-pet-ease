import express from "express";
import { initiateChat, getChatMessages, getUserChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initiate", protect, initiateChat);
router.get("/", protect, getUserChats);
router.get("/:chatId", protect, getChatMessages);

export default router;
