import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if valid Cloudinary credentials exist
const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  return Boolean(name && name !== 'your_cloud_name' && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};

// Storage engine: CloudinaryStorage if configured, otherwise MemoryStorage
const storage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'resume_analyzer/resumes',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
        public_id: (req, file) => {
          const cleanName = file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
          return `${cleanName}_${Date.now()}`;
        },
      },
    })
  : multer.memoryStorage();

// Multer instance — 5MB limit, PDF only
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'), false);
    }
  },
});

/**
 * Delete a file from Cloudinary by its public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

export { cloudinary };
