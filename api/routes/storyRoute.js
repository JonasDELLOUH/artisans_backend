import { createStory, getStories } from "../controllers/storyController.js";
import {uploadImage} from "../controllers/storageController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post('/' ,verifyToken, uploadImage("videoUrl"), createStory);
router.get("/", verifyToken, getStories);
export default router;