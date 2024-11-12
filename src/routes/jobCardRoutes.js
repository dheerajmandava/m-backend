const express = require('express');
const router = express.Router();
const {requireAuth, requireAuthWithShop } = require('../middleware/auth');
const jobCardController = require('../controllers/jobCardController');

router.use(requireAuth);
router.use(requireAuthWithShop);

// Existing routes
router.get('/unscheduled', jobCardController.getUnscheduledJobs);
router.get('/scheduled', jobCardController.getScheduledJobs);
router.post('/', jobCardController.createJobCard);
router.get('/', jobCardController.getShopJobCards);
router.get('/:id', jobCardController.getJobCard);
router.put('/:id', jobCardController.updateJobCard);
router.delete('/:id', jobCardController.deleteJobCard);
router.put('/:id/status', jobCardController.updateJobStatus);

// New routes for parts and costs
router.post('/:jobCardId/parts', jobCardController.addPartToJob);
router.put('/:jobCardId/parts/:partId', jobCardController.updatePart);
router.delete('/:jobCardId/parts/:partId', jobCardController.deletePart);

router.post('/:jobCardId/costs', jobCardController.addJobCost);
router.put('/:jobCardId/costs/:costId', jobCardController.updateJobCost);
router.delete('/:jobCardId/costs/:costId', jobCardController.deleteJobCost);

// After existing routes
router.get('/:jobCardId/parts', jobCardController.getJobParts);
router.post('/:jobCardId/parts/:partId/install', jobCardController.installJobPart);
router.post('/:jobCardId/parts/:partId/return', jobCardController.returnJobPart);

module.exports = router; 