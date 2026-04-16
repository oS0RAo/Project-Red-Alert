// src/controllers/notification.ts
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
    res.status(500).json({ error: "Get notifications failed" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    if(Array.isArray(notificationId)){
      return res.status(404).json({ error: "Notification not found" });
    }

    const data = await prisma.notification.update({
      where: { NotificationId: notificationId },
      data: { isRead: true },
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};