const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { 
  createShop, 
  getShopProfile,
  updateShop 
} = require('../controllers/shopController');

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`Shop Route: ${req.method} ${req.path}`);
  next();
});

// Create shop profile
router.post('/', requireAuth, createShop);

// Get shop profile
router.get('/profile', requireAuth, getShopProfile);

// Update shop profile
router.put('/profile', requireAuth, updateShop);

module.exports = router; 