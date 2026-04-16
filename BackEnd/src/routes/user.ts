import express from "express";
import { authMiddleware } from "../Middleware/auth.js";
import { list, remove } from "../controllers/user.js";
const router = express.Router();

router.get('/users', authMiddleware ,list);
router.delete('/users/:UserId', authMiddleware, remove);

export default router;