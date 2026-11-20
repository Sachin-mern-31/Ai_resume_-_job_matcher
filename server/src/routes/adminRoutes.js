import express from 'express';
import { getUsers, getAllResumes, getStats, deleteUser } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users',   getUsers);
router.get('/resumes', getAllResumes);
router.get('/stats',   getStats);
router.delete('/users/:id', deleteUser);

export default router;
