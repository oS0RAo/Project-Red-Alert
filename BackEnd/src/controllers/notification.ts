import { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../Middleware/auth.js";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const data = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Get notifications failed" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { notificationId } = req.params; 
    const userId = req.user!.userId;

    const data = await prisma.notification.updateMany({
      where: { 
        id: String(notificationId),
        userId: userId
      },
      data: { isRead: true },
    });

    if (data.count === 0) {
      return res.status(404).json({ error: "ไม่พบการแจ้งเตือน หรือไม่มีสิทธิ์เข้าถึง" });
    }

    res.json({ msg: "อัปเดตสถานะการอ่านสำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed" });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const data = await prisma.notification.updateMany({
      where: { 
        userId: userId,
        isRead: false // อัปเดตเฉพาะอันที่ยังไม่อ่าน
      },
      data: { isRead: true },
    });

    res.json({ msg: `อ่านทั้งหมดเรียบร้อยแล้ว (${data.count} รายการ)` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update all failed" });
  }
};