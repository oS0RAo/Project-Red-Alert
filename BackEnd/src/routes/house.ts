import express from "express";
import { createHouse, getHouseById, deleteHouse } from "../controllers/้house.js";
import { authMiddleware } from "../Middleware/auth.js";
const router = express.Router()

router.post('/createHouse', authMiddleware, createHouse);
router.get('/getHouse/:houseId', authMiddleware, getHouseById);
router.delete('/deleteHouse/:houseId', authMiddleware, deleteHouse);

export default router;