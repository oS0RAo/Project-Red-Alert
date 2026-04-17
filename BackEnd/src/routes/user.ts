<<<<<<< HEAD
<<<<<<< HEAD
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

=======
import express from "express";
import { authMiddleware } from "../Middleware/auth.js";
import { list, remove } from "../controllers/user.js";
const router = express.Router();

router.get('/users', authMiddleware ,list);
router.delete('/users/:UserId', authMiddleware, remove);

>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
import express from "express";
import { authMiddleware } from "../Middleware/auth.js";
import { list, remove } from "../controllers/user.js";
const router = express.Router();

router.get('/users', authMiddleware ,list);
router.delete('/users/:UserId', authMiddleware, remove);

>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
export default router;