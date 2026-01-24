import express from "express";
import {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
} from "../controllers/blogController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Admin only
router.post("/", protect, admin, createBlog);
router.put("/:id", protect, admin, updateBlog);
router.delete("/:id", protect, admin, deleteBlog);

export default router;
