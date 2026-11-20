import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if valid Cloudinary credentials exist
export const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  return Boolean(
    name &&
    name !== 'your_cloud_name' &&
    name !== 'your_cloudinary_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Memory storage keeps file buffer directly in RAM for instant parsing without network lag
const storage = multer.memoryStorage();

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
 * Upload a file buffer directly to Cloudinary via stream
 */
export const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve) => {
    if (!isCloudinaryConfigured()) {
      return resolve({ url: null, publicId: null });
    }

    try {
      const cleanName = (originalname || 'resume')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resume_analyzer/resumes',
          resource_type: 'raw',
          public_id: `${cleanName}_${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            console.warn('Cloudinary upload warning:', error.message);
            return resolve({ url: null, publicId: null });
          }
          resolve({
            url: result?.secure_url || result?.url || null,
            publicId: result?.public_id || null,
          });
        }
      );

      uploadStream.end(buffer);
    } catch (err) {
      console.warn('Cloudinary stream error:', err.message);
      resolve({ url: null, publicId: null });
    }
  });
};

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
