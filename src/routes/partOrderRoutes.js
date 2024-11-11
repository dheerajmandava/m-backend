const express = require('express');
const router = express.Router();
const { requireAuthWithShop } = require('../middleware/auth');
const partOrderController = require('../controllers/partOrderController');

router.use(requireAuthWithShop);

router.get('/', partOrderController.getPartOrders);
router.get('/:id', partOrderController.getPartOrderById);
router.post('/', partOrderController.createPartOrder);
router.put('/:id/status', partOrderController.updateOrderStatus);

module.exports = router; 