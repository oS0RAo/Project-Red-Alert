import express from 'express';
import { createSensorData } from '../controllers/sensorData.js';
import { authMiddleware } from '../Middleware/auth.js';
const router = express.Router();
router.post('/createSensorData', authMiddleware, createSensorData);
export default router;
//# sourceMappingURL=sensorData.js.map