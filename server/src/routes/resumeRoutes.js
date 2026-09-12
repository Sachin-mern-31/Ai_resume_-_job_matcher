import express from 'express';
import { uploadAndAnalyze, getHistory, getById, deleteById } from '../controllers/resumeController.js';
import { protect }  from '../middleware/authMiddleware.js';
import { upload }   from '../utils/cloudinaryService.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('resume'), uploadAndAnalyze);
router.get('/history', getHistory);
router.get('/:id', getById);
router.delete('/:id', deleteById);

export default router;
