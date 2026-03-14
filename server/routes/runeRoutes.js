/**
 * Rune Routes - Định tuyến cho các endpoint liên quan đến rune
 */

const express = require('express');
const router = express.Router();
const runeController = require('../controllers/runeController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', runeController.getRunes);
router.get('/:id', runeController.getRuneById);

// Admin routes
router.post('/', authenticate, authorize(['admin', 'editor']), runeController.createRune);
router.put('/:id', authenticate, authorize(['admin', 'editor']), runeController.updateRune);
router.delete('/:id', authenticate, authorize(['admin']), runeController.deleteRune);

module.exports = router;
