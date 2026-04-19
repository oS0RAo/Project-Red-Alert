import express from 'express';
import { list, remove, getProfile, updateProfile, savePushToken } from '../controllers/user.js'; 
import { verifyToken } from '../Middleware/authVerify.js';

const router = express.Router();

router.get('/list', verifyToken, list);
router.delete('/remove/:UserId', verifyToken, remove);

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

router.put('/push-token', verifyToken, savePushToken);

export default router;