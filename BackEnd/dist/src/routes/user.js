import express from 'express';
import { list, remove, getProfile, updateProfile } from '../controllers/user.js';
import { verifyToken } from '../Middleware/authVerify.js';
const router = express.Router();
router.get('/list', verifyToken, list);
router.delete('/remove/:UserId', verifyToken, remove);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
export default router;
//# sourceMappingURL=user.js.map