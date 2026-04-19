import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.js';
import { authMiddleware } from '../Middleware/auth.js';
const router = express.Router();
router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/:id', authMiddleware, markAsRead);
export default router;
//# sourceMappingURL=notification.js.map