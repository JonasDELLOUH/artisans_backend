import express from "express";
import {createSalon} from "../controllers/salonController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {uploadImage} from "../controllers/storageController.js";
const router = express.Router();

router.post('/', verifyToken, uploadImage("imageUrl"), createSalon);

export default router;