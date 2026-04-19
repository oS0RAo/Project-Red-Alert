import express from 'express';
import { listHouses, createHouse } from '../controllers/house';
import { verifyToken } from '../Middleware/authVerify';
import { prisma } from '../../lib/prisma'; 

const router = express.Router();

router.get('/houses', verifyToken, listHouses);
router.post('/houses', verifyToken, createHouse);

router.put('/houses/:id', verifyToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;
    const userId = req.user.id;

    const existingHouse = await prisma.house.findFirst({
      where: { id: id, userId: userId }
    });

    if (!existingHouse) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์แก้ไขบ้านหลังนี้" });
    }

    const updatedHouse = await prisma.house.update({
      where: { id: id },
      data: { 
        name: name.trim(), 
        address: address.trim() 
      },
      include: {
        _count: { select: { sensors: true } }
      }
    });

    res.json({ msg: "อัปเดตข้อมูลสำเร็จ", house: updatedHouse });
  } catch (error) {
    console.error("Update house error:", error);
    res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลได้" });
  }
});

router.delete('/houses/:id', verifyToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingHouse = await prisma.house.findFirst({
      where: { id: id, userId: userId }
    });

    if (!existingHouse) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์ลบบ้านหลังนี้" });
    }

    await prisma.house.delete({
      where: { id: id }
    });

    res.json({ msg: "ลบบ้านเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Delete house error:", error);
    res.status(500).json({ error: "ไม่สามารถลบบ้านได้" });
  }
});

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

export default router;