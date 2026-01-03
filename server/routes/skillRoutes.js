const express = require('express');
const router = express.Router();
const { getMySkills, updateSkills, deleteSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMySkills);
router.post('/update', protect, updateSkills);
router.delete('/:type/:name', protect, deleteSkill);

module.exports = router;