import express from 'express';
import { register, login } from '../controllers/auth.js';
import { registerMiddleware, loginMiddleware } from '../Middleware/auth.js';
const router = express.Router();

router.post('/register', registerMiddleware, register);
router.post('/login', loginMiddleware, login);

export default router;