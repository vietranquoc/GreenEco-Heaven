const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Đường dẫn tới middleware

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user', authMiddleware, authController.getCurrentUser); // Thêm route mới

module.exports = router;