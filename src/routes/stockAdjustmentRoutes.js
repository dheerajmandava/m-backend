const express = require('express');
const router = express.Router();
const { requireAuthWithShop } = require('../middleware/auth');
const stockAdjustmentController = require('../controllers/stockAdjustmentController');

router.use(requireAuthWithShop);

router.post('/', stockAdjustmentController.createStockAdjustment);
router.get('/', stockAdjustmentController.getStockAdjustments);

module.exports = router; 