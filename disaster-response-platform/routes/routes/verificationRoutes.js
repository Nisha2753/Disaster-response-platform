const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

// GET /verifications?status=pending - Fetch verifications by status (optional filter)
router.get('/', verificationController.getVerifications);

// PATCH /verifications/:id - Verify or update verification status of an entry
router.patch('/:id', verificationController.verifyEntry);

module.exports = router;
