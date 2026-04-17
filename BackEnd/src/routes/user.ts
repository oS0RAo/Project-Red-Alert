import express from 'express';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../Middleware/authVerify';

const router = express.Router();

router.put('/profile', verifyToken, async (req: any, res) => {
  try {
    const { emergencyPhone, pushNotify } = req.body;
    const userId = req.user.UserId;

    await prisma.user.update({
      where: { id: userId },
      data: { 
        emergencyPhone, 
        pushNotify 
      }
    });

    res.json({ msg: "อัปเดตเบอร์ติดต่อฉุกเฉินสำเร็จ" });
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถอัปเดตโปรไฟล์ได้" });
  }
});

export default router;