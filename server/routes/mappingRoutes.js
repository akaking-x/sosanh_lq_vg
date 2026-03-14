/**
 * Mapping Routes - Định tuyến cho các endpoint liên quan đến ánh xạ hero
 */

const express = require('express');
const router = express.Router();
const mappingController = require('../controllers/mappingController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', mappingController.getMappings);
router.get('/hero/:slug', mappingController.getComparisonByHeroSlug);
router.get('/:id', mappingController.getMappingById);

// Admin routes
router.post('/', authenticate, authorize(['admin', 'editor']), mappingController.createMapping);
router.put('/:id', authenticate, authorize(['admin', 'editor']), mappingController.updateMapping);
router.delete('/:id', authenticate, authorize(['admin']), mappingController.deleteMapping);

module.exports = router;
