import express from 'express';
import { createSensor, getSensors, updateSensorStatus   } from '../controllers/sensor.js';
import { authMiddleware } from '../Middleware/auth.js';
const router = express.Router();

router.post('/createSensor', authMiddleware, createSensor);
router.get('/sensors/:houseId', authMiddleware, getSensors);
router.post('/updateSensorStatus/:sensorId', authMiddleware, updateSensorStatus);

export default router;