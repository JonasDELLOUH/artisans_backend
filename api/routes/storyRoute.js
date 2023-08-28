import { createStory, getStories } from "../controllers/storyController.js";
import {uploadImage, uploadVideo} from "../controllers/storageController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post('/' ,verifyToken, uploadVideo("videoUrl"), createStory);
router.get("/", verifyToken, getStories);
export default router;