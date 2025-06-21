const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// GET /resources - Fetch all resources
router.get('/', resourceController.getAllResources);

// GET /resources/:id - Fetch a single resource by ID
router.get('/:id', resourceController.getResourceById);

// POST /resources - Create a new resource entry
router.post('/', resourceController.createResource);

// PUT /resources/:id - Update an existing resource
router.put('/:id', resourceController.updateResource);

// DELETE /resources/:id - Delete a resource
router.delete('/:id', resourceController.deleteResource);

module.exports = router;
