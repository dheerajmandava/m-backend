const express = require('express');
const router = express.Router();
const { requireAuthWithShop } = require('../middleware/auth');
const jobCardController = require('../controllers/jobCardController');

router.use(requireAuthWithShop);

router.post('/', jobCardController.createJobCard);
router.get('/', jobCardController.getShopJobCards);
router.patch('/:id/status', jobCardController.updateJobCardStatus);

module.exports = router; 