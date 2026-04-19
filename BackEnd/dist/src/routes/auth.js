import express from 'express';
import { register, login } from '../controllers/auth';
import { registerMiddleware, loginMiddleware } from '../Middleware/auth';
const router = express.Router();
router.post('/register', registerMiddleware, register);
router.post('/login', loginMiddleware, login);
export default router;
//# sourceMappingURL=auth.js.map