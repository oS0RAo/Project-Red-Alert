import express from 'express';
import { listHouses, createHouse } from '../controllers/house';
import { verifyToken } from '../Middleware/authVerify';
import { prisma } from '../../lib/prisma';
const router = express.Router();
router.get('/houses', verifyToken, listHouses);
router.post('/houses', verifyToken, createHouse);
router.get('/houses/:houseId/sensors', verifyToken, async (req, res) => {
    try {
        const { houseId } = req.params;
        const sensors = await prisma.sensor.findMany({
            where: {
                houseId: houseId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(sensors);
    }
    catch (error) {
        console.error("Fetch sensors error:", error);
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเซนเซอร์ได้" });
    }
});
export default router;
//# sourceMappingURL=house.js.map