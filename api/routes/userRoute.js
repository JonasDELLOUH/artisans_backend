import express from 'express';
import { changePassword, updateUserProfile, verifyUserNameExist } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/change-password', verifyToken, changePassword);
router.put('/update-profile', verifyToken, updateUserProfile);
router.post("/username-exist", verifyUserNameExist);

export default router;