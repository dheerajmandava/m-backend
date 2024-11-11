const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/inventorySettingsController');

router.get('/settings', settingsController.getInventorySettings);
router.put('/settings', settingsController.updateInventorySettings);

module.exports = router; 