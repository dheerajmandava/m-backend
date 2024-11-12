const express = require('express');
const router = express.Router();
const { requireAuth, requireAuthWithShop } = require('../middleware/auth');
const mechanicController = require('../controllers/mechanicController');

router.use(requireAuth);
router.use(requireAuthWithShop);

router.post('/', mechanicController.createMechanic);
router.get('/', mechanicController.getShopMechanics);
router.get('/:id', mechanicController.getMechanic);
router.patch('/:id', mechanicController.updateMechanic);
router.delete('/:id', mechanicController.deleteMechanic);

module.exports = router; 