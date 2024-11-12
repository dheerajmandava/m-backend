const express = require('express');
const router = express.Router();
const { requireAuth, requireAuthWithShop } = require('../middleware/auth');
const scheduleController = require('../controllers/scheduleController');
    
router.use(requireAuth);
router.use(requireAuthWithShop);

router.post('/', scheduleController.scheduleJob);
router.get('/', scheduleController.getSchedule);
router.put('/:id', scheduleController.updateSchedule);

module.exports = router;