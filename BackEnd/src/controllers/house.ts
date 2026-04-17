import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../Middleware/authVerify';

export const listHouses = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.UserId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const houses = await prisma.house.findMany({
            where: { userId: userId },
            include: {
                _count: {
                    select: { sensors: true }
                }
            }
        });

        res.status(200).json(houses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ดึงข้อมูลบ้านล้มเหลว" });
    }
};

export const createHouse = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.UserId;
        const { name, address } = req.body;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        if (!name) return res.status(400).json({ error: "กรุณากรอกชื่อบ้าน" });

        const newHouse = await prisma.house.create({
            data: {
                name: name,
                address: address || "",
                userId: userId
            }
        });

        res.status(201).json({ msg: "สร้างบ้านสำเร็จ", house: newHouse });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "สร้างบ้านล้มเหลว" });
    }
};