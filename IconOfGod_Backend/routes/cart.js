const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const authenticateUser = require('../middleware/authenticateUser');

// Secure routes using middleware
router.get('/', verifyToken, getCart);
router.post('/add', verifyToken, addToCart);
router.post('/remove', verifyToken, removeFromCart);
router.delete('/remove/:itemId', authenticateUser, deleteCartItem);
module.exports = router;