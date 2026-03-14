/**
 * Hero Routes - Định tuyến cho các endpoint liên quan đến anh hùng
 */

const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', heroController.getHeroes);
router.get('/:slug', heroController.getHeroBySlug);
router.get('/id/:id', heroController.getHeroById);

// Admin routes
router.post('/', authenticate, authorize(['admin', 'editor']), heroController.createHero);
router.put('/:id', authenticate, authorize(['admin', 'editor']), heroController.updateHero);
router.delete('/:id', authenticate, authorize(['admin']), heroController.deleteHero);

module.exports = router;
