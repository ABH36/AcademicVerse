const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary'); // Required for cleanup
const logger = require('../utils/logger');

// @desc    Create a new Project (Hardened)
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    // 1. Freeze Check
    if (req.user.isFrozen) {
      return res.status(403).json({ message: 'Account frozen. Contact admin.' });
    }

    // 2. LOCK-IN 2: Limit Total Projects (Anti-Spam/DB Abuse)
    const count = await Project.countDocuments({ user: req.user.id });
    if (count >= 50) {
      return res.status(403).json({ message: 'Project limit reached (50 max).' });
    }

    // 3. LOCK-IN 3: Limit Screenshots (Security Backup)
    if (req.files && req.files.length > 5) {
      return res.status(400).json({ message: 'Max 5 screenshots allowed.' });
    }

    const { title, tagline, description, techStack, github, liveDemo, videoDemo, isPublic } = req.body;

    // 4. LOCK-IN 4: Default Private for Fresh Accounts (Anti-Fake)
    // If this is their first project (count === 0), force private.
    // Otherwise, respect user choice.
    let finalVisibility = true;
    if (count === 0) {
        finalVisibility = false;
    } else {
        // Handle string 'false' from FormData or boolean
        finalVisibility = isPublic === 'false' ? false : true;
    }

    // Process Images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }

    // Process Tech Stack
    let stackArray = [];
    if (techStack) {
      stackArray = Array.isArray(techStack) 
        ? techStack 
        : techStack.split(',').map(tag => tag.trim());
    }

    const project = await Project.create({
      user: req.user.id,
      title,
      tagline,
      description,
      techStack: stackArray,
      links: { github, liveDemo, videoDemo },
      images: imageUrls,
      isPublic: finalVisibility
    });

    logger.info(`Project Created: ${title} by ${req.user.id}. Visibility: ${finalVisibility}`);
    res.status(201).json(project);

  } catch (error) {
    logger.error(`Create Project Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get All Projects of Current User
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete Project (Hardened)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Verify ownership
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // LOCK-IN 1: Cloudinary Cleanup (Cost & GDPR)
    if (project.images && project.images.length > 0) {
        for (const url of project.images) {
            try {
                // Extract public ID from URL
                // URL Format assumption: .../academicverse_avatars/filename.jpg
                const urlParts = url.split('/');
                const fileNameWithExt = urlParts.pop();
                const publicId = fileNameWithExt.split('.')[0];
                const folder = 'academicverse_avatars'; // Must match uploadMiddleware folder
                
                await cloudinary.uploader.destroy(`${folder}/${publicId}`);
            } catch (err) {
                logger.error(`Failed to delete image: ${url} - ${err.message}`);
                // Continue deleting others even if one fails
            }
        }
    }

    await project.deleteOne();
    logger.info(`Project Deleted: ${req.params.id}`);
    res.json({ message: 'Project removed' });

  } catch (error) {
    logger.error(`Delete Project Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};