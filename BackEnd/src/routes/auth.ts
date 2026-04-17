import express from 'express';
<<<<<<< HEAD
<<<<<<< HEAD
// 🔴 ใช้ import แทน require เพื่อให้ดึง Type มาใช้งานได้สมบูรณ์
import { register, login } from '../controllers/auth';
import { registerMiddleware, loginMiddleware } from '../Middleware/auth';

=======
import { register, login } from '../controllers/auth.js';
import { registerMiddleware, loginMiddleware } from '../Middleware/auth.js';
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
import { register, login } from '../controllers/auth.js';
import { registerMiddleware, loginMiddleware } from '../Middleware/auth.js';
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
const router = express.Router();

router.post('/register', registerMiddleware, register);
router.post('/login', loginMiddleware, login);

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = router;
=======
export default router;
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
export default router;
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
