import express from "express";
import {createSalon, getAllSalon, getUserSalon, likeSalon, updateSalon, verifyLikeStatus} from "../controllers/salonController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {uploadImage} from "../controllers/storageController.js";
const router = express.Router();

router.post('/', verifyToken, uploadImage("imageUrl"), createSalon);
router.get('/', verifyToken, getAllSalon);
router.put('/:id', verifyToken, uploadImage("imageUrl"), updateSalon);
router.post('/like/:id', verifyToken, likeSalon);
router.post('/verify_like_status/:id', verifyToken, verifyLikeStatus);
router.get('/user_salon/', verifyToken, getUserSalon);

export default router;
