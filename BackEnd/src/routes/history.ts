import express from 'express';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../Middleware/authVerify';

const router = express.Router();

router.get('/history', verifyToken, async (req, res) => {
  try {
    const logs = await prisma.eventLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sensor: { select: { name: true } }
      }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลประวัติได้" });
  }
});

export default router;