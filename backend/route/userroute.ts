import express from 'express';
import { updateProfile, getUserProfile } from '../controllers/userController';

const router = express.Router();

router.get('/profile', getUserProfile);
router.put('/profile', updateProfile);

export default router;