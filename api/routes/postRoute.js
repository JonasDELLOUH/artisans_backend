import { createPost, getPosts } from "../controllers/postController.js";
import {uploadImage} from "../controllers/storageController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post('/' ,verifyToken, uploadImage("imageUrl"), createPost);
router.get("/", verifyToken, getPosts);
export default router;