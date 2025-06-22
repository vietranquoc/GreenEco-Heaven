const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/', authMiddleware, adminMiddleware, userController.getUsers);
router.get('/:userId', authMiddleware, userController.getUserById);
router.put('/:userId', authMiddleware, userController.updateUser);
router.delete('/:userId', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;