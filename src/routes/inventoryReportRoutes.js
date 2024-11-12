const express = require('express');
const router = express.Router();
const { requireAuth, requireAuthWithShop } = require('../middleware/auth');
const inventoryReportController = require('../controllers/inventoryReportController');

router.use(requireAuth);
router.use(requireAuthWithShop);

router.get('/reports', inventoryReportController.getInventoryReports);
router.get('/export', inventoryReportController.exportInventoryReport);

module.exports = router; 