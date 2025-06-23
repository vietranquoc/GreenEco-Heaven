const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, cartController.addToCart);
router.get('/', authMiddleware, cartController.getCart);
router.delete('/:productId', authMiddleware, cartController.removeFromCart);
router.put('/', authMiddleware, cartController.updateCartItem);
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;