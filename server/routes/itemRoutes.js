/**
 * Item Routes - Định tuyến cho các endpoint liên quan đến vật phẩm
 */

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', itemController.getItems);
router.get('/:slug', itemController.getItemBySlug);
router.get('/id/:id', itemController.getItemById);

// Admin routes
router.post('/', authenticate, authorize(['admin', 'editor']), itemController.createItem);
router.put('/:id', authenticate, authorize(['admin', 'editor']), itemController.updateItem);
router.delete('/:id', authenticate, authorize(['admin']), itemController.deleteItem);

module.exports = router;
