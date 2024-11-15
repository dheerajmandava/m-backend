const express = require('express');
const router = express.Router();
const { 
  createEstimate,
  getEstimate,
  updateEstimateStatus,
  listJobEstimates
} = require('../controllers/estimateController');
const { requireAuth, requireAuthWithShop } = require('../middleware/auth'); 

// For routes that need auth and shop profile
router.use(requireAuthWithShop);

// List all estimates for a job - This should come BEFORE the :id route
router.get('/jobs/:id', listJobEstimates);

// Create new estimate for a job
router.post('/jobs/:id', createEstimate);

// Get estimate by ID
router.get('/:id', getEstimate);

// Update estimate status
router.patch('/:id/status', updateEstimateStatus);

module.exports = router; 