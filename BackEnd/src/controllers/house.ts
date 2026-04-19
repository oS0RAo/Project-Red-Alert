import { Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AuthRequest } from '../Middleware/authVerify.js';

// ดึงรายการบ้านทั้งหมดของ User
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

// สร้างบ้านใหม่
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

// ดึงข้อมูลบ้าน 1 หลัง รวมเซนเซอร์ข้างใน
export const getHouseById = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.UserId;
        const { houseId } = req.params;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const house = await prisma.house.findFirst({
            where: {
                id: String(houseId),
                userId: userId,
            },
            include: {
                sensors: true,
            },
        });

        if (!house) return res.status(404).json({ error: "ไม่พบข้อมูลบ้าน หรือไม่มีสิทธิ์เข้าถึง" });

        res.status(200).json(house);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ดึงข้อมูลบ้านล้มเหลว" });
    }
};

// ลบบ้าน
export const deleteHouse = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.UserId;
        const { houseId } = req.params;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // เช็คก่อนว่ามีบ้านหลังนี้อยู่จริง และเป็นของ User คนนี้จริงๆ
        const existingHouse = await prisma.house.findFirst({
            where: { id: String(houseId), userId: userId }
        });

        if (!existingHouse) return res.status(404).json({ error: "ไม่พบข้อมูลบ้าน หรือไม่มีสิทธิ์เข้าถึง" });

        await prisma.house.delete({
            where: { id: String(houseId) },
        });

        res.status(200).json({ msg: "ลบบ้านสำเร็จ" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ลบบ้านล้มเหลว" });
    }
};