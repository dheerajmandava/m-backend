const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/inventorySettingsController');
const { requireAuth, requireAuthWithShop } = require('../middleware/auth'); 

router.use(requireAuth);
router.use(requireAuthWithShop);

router.get('/settings', settingsController.getInventorySettings);
router.put('/settings', settingsController.updateInventorySettings);

module.exports = router; 