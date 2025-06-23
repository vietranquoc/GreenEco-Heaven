const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);
router.put('/:id', authMiddleware, orderController.updateOrderStatus);
router.get('/admin/inventory', authMiddleware, adminMiddleware, orderController.getInventory);
router.get('/admin/stats', authMiddleware, adminMiddleware, orderController.getStats);

module.exports = router;