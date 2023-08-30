import express from "express";
import {createSalon, getAllSalon, getUserSalon, likeSalon, updateSalon} from "../controllers/salonController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {uploadImage} from "../controllers/storageController.js";
const router = express.Router();

router.post('/', verifyToken, uploadImage("imageUrl"), createSalon);
router.get('/', verifyToken, getAllSalon);
router.put('/:id', verifyToken, uploadImage("imageUrl"), updateSalon);
router.post('/like/:id', verifyToken, likeSalon);
router.get('/userSalon/', verifyToken, getUserSalon);

export default router;