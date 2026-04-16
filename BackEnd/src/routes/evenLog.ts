import express from 'express';
import { createEventLog, getLogs } from '../controllers/eventLog.js';
import { authMiddleware } from '../Middleware/auth.js';
const router = express.Router();

router.post('/createEventLog', authMiddleware, createEventLog);
router.get('/eventLogs', authMiddleware, getLogs);

export default router;