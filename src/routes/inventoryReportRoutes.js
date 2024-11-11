const express = require('express');
const router = express.Router();
const { requireAuthWithShop } = require('../middleware/auth');
const inventoryReportController = require('../controllers/inventoryReportController');

router.use(requireAuthWithShop);

router.get('/reports', inventoryReportController.getInventoryReports);
router.get('/export', inventoryReportController.exportInventoryReport);

module.exports = router; 