import { checkout, getMyOrders, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import express from 'express';

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/myorders", protect, getMyOrders);

// Admin Routes
router.get("/all", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
