const express = require('express');
const router = express.Router();
const updateController = require('../controllers/updateController');

// GET /updates/:disasterId - Get all updates for a specific disaster
router.get('/:disasterId', updateController.getUpdatesByDisasterId);

// POST /updates - Create a new update
router.post('/', updateController.createUpdate);

// DELETE /updates/:updateId - Delete an update by ID
router.delete('/:updateId', updateController.deleteUpdate);

module.exports = router;
