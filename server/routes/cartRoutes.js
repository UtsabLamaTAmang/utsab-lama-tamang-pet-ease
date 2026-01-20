import { protect } from '../middleware/authMiddleware.js';
import { getCart, addToCart, removeFromCart, updateCartItem } from '../controllers/cartController.js';
import express from 'express';

const router = express.Router();

router.use(protect); // Protect all cart routes

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/:productId', removeFromCart);
router.put('/update', updateCartItem);

export default router;
