/**
 * Summoner Skill Routes - Định tuyến cho các endpoint liên quan đến Kỹ năng Pháp Sư
 */

const express = require('express');
const router = express.Router();
const summonerSkillController = require('../controllers/summonerSkillController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', summonerSkillController.getSkills);
router.get('/:id', summonerSkillController.getSkillById);

// Admin routes
router.post('/', authenticate, authorize(['admin', 'editor']), summonerSkillController.createSkill);
router.put('/:id', authenticate, authorize(['admin', 'editor']), summonerSkillController.updateSkill);
router.delete('/:id', authenticate, authorize(['admin']), summonerSkillController.deleteSkill);

module.exports = router;
