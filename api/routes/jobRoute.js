import express from "express";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {createJob} from "../controllers/jobController.js";
import {uploadImage} from "../controllers/storageController.js";

const router = express.Router();

router.post("/", verifyToken, uploadImage("imageUrl"), createJob);

export default router;