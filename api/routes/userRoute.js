import express from 'express';
import { changePassword, updateUserProfile } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/change-password', verifyToken, changePassword);
router.put('/update-profile', verifyToken, updateUserProfile);

export default router;