import express from 'express';
import { updateProfile, getUserProfile, checkDriverStatus } from '../controllers/userController';

const router = express.Router();

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateProfile);

// Driver status routes
router.get('/driver-check', checkDriverStatus);

export default router;