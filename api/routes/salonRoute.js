import express from "express";
import {createSalon} from "../controllers/salonController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post('/', verifyToken, createSalon);

export default router;