import express from "express";
import {createSalon, createSalonWithTransaction} from "../controllers/salonController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {uploadImage} from "../middlewares/storageMiddleware.js";
const router = express.Router();
import multer from "multer";

const upload = multer();

router.post('/', createSalonWithTransaction);

export default router;