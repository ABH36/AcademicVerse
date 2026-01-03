const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: 100
  },
  tagline: {
    type: String, // A short "elevator pitch" for the card view
    required: [true, 'A short tagline is required'],
    maxlength: 150
  },
  description: {
    type: String, // Full details
    required: true,
    maxlength: 2000
  },
  techStack: [{
    type: String, // e.g., ["React", "Node.js", "AI"]
    trim: true
  }],
  links: {
    github: { type: String, default: '' },
    liveDemo: { type: String, default: '' },
    videoDemo: { type: String, default: '' }, // YouTube/Loom link
  },
  images: [{
    type: String, // Array of Cloudinary URLs (Screenshots)
  }],
  isPublic: {
    type: Boolean,
    default: true, // Show on public profile by default
  },
  likes: [{ // Simple engagement metric
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);