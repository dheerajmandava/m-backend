const express = require('express');
const router = express.Router();
const { requireAuthWithShop } = require('../middleware/auth');
const supplierController = require('../controllers/supplierController');

router.use(requireAuthWithShop);

router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.get('/:id/orders', supplierController.getSupplierOrders);

module.exports = router; 