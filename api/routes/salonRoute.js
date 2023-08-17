import express from "express";
import {createSalon, getAllSalon} from "../controllers/salonController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {uploadImage} from "../controllers/storageController.js";
const router = express.Router();

router.post('/', verifyToken, uploadImage("imageUrl"), createSalon);
router.get('/', verifyToken, getAllSalon);

export default router;