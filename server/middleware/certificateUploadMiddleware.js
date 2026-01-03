const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'academicverse_certificates', // Dedicated folder for Certs
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], // Added PDF support if needed
    // No strict crop transformation here (Certificates need full view)
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit (Certs can be larger)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only Images or PDFs allowed.'), false);
    }
  },
});

module.exports = upload;