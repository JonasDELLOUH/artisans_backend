import { createPost } from "../controllers/postController";
import {uploadImage} from "../controllers/storageController.js";
import {verifyToken} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/', verifyToken,uploadImage, createPost)
export default router;