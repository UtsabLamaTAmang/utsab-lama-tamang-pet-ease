import express from "express";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    getUserOrders,
    updateOrderStatus,
} from "../controllers/storeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

import { productUpload } from "../middleware/productUpload.js";

const router = express.Router();

// Product routes
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", protect, admin, productUpload.any(), createProduct);
router.put("/products/:id", protect, admin, productUpload.any(), updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);


// Order routes
router.post("/orders", protect, createOrder);
router.get("/orders", protect, getUserOrders);
router.patch("/orders/:id/status", protect, admin, updateOrderStatus);

export default router;
