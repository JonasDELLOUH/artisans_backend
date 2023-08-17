import express from "express";
import {createSalon, getAllSalon, getNearestSalon} from "../controllers/salonController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {uploadImage} from "../controllers/storageController.js";
const router = express.Router();

router.post('/', verifyToken, uploadImage("imageUrl"), createSalon);
router.get('/', verifyToken, getAllSalon);
router.get("/nearest/", verifyToken, getNearestSalon);

export default router;