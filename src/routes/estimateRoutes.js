const express = require('express');
const router = express.Router();
const { 
  createEstimate,
  getEstimate,
  updateEstimateStatus,
  listJobEstimates
} = require('../controllers/estimateController');
const { requireAuthWithShop } = require('../middleware/auth');

router.use(requireAuthWithShop);

// Create new estimate for a job
router.post('/jobs/:jobCardId/estimates', createEstimate);

// Get estimate by ID
router.get('/estimates/:id', getEstimate);

// Update estimate status
router.patch('/estimates/:id/status', updateEstimateStatus);

// List all estimates for a job
router.get('/jobs/:jobCardId/estimates', listJobEstimates);

module.exports = router; 