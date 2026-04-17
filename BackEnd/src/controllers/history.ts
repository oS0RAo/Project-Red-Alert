import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.eventLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sensor: {
          select: { name: true, serialNumber: true }
        }
      }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลประวัติได้" });
  }
};