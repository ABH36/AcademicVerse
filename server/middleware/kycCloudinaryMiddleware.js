const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // Existing Config

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    
    // Check if file is PDF
    const isPdf = file.mimetype === 'application/pdf';

    return {
      folder: 'academicverse_kyc', // KYC documents alag folder mein jayenge
      resource_type: 'auto',       // Important: Auto detect (Image or PDF)
      format: isPdf ? 'pdf' : undefined, // Force PDF extension if PDF
      // Note: Hum yahan koi transformation (crop/resize) nahi laga rahe
      // taaki PDF corrupt na ho.
      public_id: `${file.fieldname}-${Date.now()}`
    };
  },
});

const fileFilter = (req, file, cb) => {
  // Allow PDF, JPG, PNG, JPEG
  if (
    file.mimetype === 'application/pdf' || 
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PDF, JPG, and PNG are allowed.'), false);
  }
};

const kycUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: fileFilter
});

module.exports = kycUpload;