import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import multer from "multer";

const upload = multer();

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
