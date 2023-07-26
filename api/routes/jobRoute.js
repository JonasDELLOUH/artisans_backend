import express from "express";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {createJob, getAllJobs, updateJob} from "../controllers/jobController.js";
import {uploadImage} from "../controllers/storageController.js";

const router = express.Router();

router.post("/", verifyToken, uploadImage("imageUrl"), createJob);
router.get('/', verifyToken, getAllJobs);
router.get('/', verifyToken,uploadImage, updateJob)
export default router;