const express = require('express');
const router = express.Router();
const { createProject, getMyProjects, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route: Get my projects
router.get('/me', protect, getMyProjects);

// Route: Create Project (Supports max 5 images)
router.post(
  '/', 
  protect, 
  upload.array('screenshots', 5), // 'screenshots' is the field name
  createProject
);

// Route: Delete Project
router.delete('/:id', protect, deleteProject);

module.exports = router;