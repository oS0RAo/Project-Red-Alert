<<<<<<< HEAD
<<<<<<< HEAD
import express from 'express';
import { listHouses, createHouse } from '../controllers/house';
import { verifyToken } from '../Middleware/authVerify';
import { prisma } from '../../lib/prisma'; 

const router = express.Router();

router.get('/houses', verifyToken, listHouses);
router.post('/houses', verifyToken, createHouse);

router.get('/houses/:houseId/sensors', verifyToken, async (req, res) => {
  try {
    const { houseId } = req.params as { houseId: string };
    
    const sensors = await prisma.sensor.findMany({
      where: {
        houseId: houseId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(sensors);
  } catch (error) {
    console.error("Fetch sensors error:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเซนเซอร์ได้" });
  }
});
=======
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
import express from "express";
import { createHouse, getHouseById, deleteHouse } from "../controllers/้house.js";
import { authMiddleware } from "../Middleware/auth.js";
const router = express.Router()

router.post('/createHouse', authMiddleware, createHouse);
router.get('/getHouse/:houseId', authMiddleware, getHouseById);
router.delete('/deleteHouse/:houseId', authMiddleware, deleteHouse);
<<<<<<< HEAD
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b

export default router;