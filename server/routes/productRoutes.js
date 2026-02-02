import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { productUpload } from '../middleware/productUpload.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, admin, productUpload.any(), createProduct);

router.route('/:id')
    .put(protect, admin, productUpload.any(), updateProduct)
    .delete(protect, admin, deleteProduct);

export default router;
