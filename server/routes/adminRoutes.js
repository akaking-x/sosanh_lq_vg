/**
 * Admin Routes - Định tuyến cho các endpoint quản trị
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', adminController.login);

// Protected routes
router.get('/profile', authenticate, adminController.getProfile);
router.get('/dashboard', authenticate, adminController.getDashboard);
router.post('/change-password', authenticate, adminController.changePassword);

module.exports = router;
