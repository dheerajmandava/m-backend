const express = require('express');
const router = express.Router();
const { requireAuth, requireAuthWithShop } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

router.use(requireAuth);
router.use(requireAuthWithShop);

router.get('/', inventoryController.getInventory);
router.get('/low-stock', inventoryController.getLowStockItems);
router.post('/', inventoryController.addInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router; 