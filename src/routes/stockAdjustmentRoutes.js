const express = require('express');
const router = express.Router();
const { requireAuth, requireAuthWithShop } = require('../middleware/auth');
const stockAdjustmentController = require('../controllers/stockAdjustmentController');

router.use(requireAuth);
router.use(requireAuthWithShop);

router.post('/', stockAdjustmentController.createStockAdjustment);
router.get('/', stockAdjustmentController.getStockAdjustments);

module.exports = router; 