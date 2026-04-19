import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../Middleware/authVerify';

export const listSensors = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const houseId = String(req.params.houseId);
        const userId = req.user?.UserId; 

        if (!userId) {
            return res.status(401).json({ error: "ไม่พบข้อมูลผู้ใช้งานใน Token" });
        }

        const house = await prisma.house.findFirst({
            where: { id: houseId, userId: userId },
            include: {
                user: {
                    select: { fullName: true, pushNotify: true }
                }
            }
        });

        if (!house) return res.status(404).json({ error: "ไม่พบข้อมูลบ้าน หรือคุณไม่มีสิทธิ์เข้าถึง" });

        const sensors = await prisma.sensor.findMany({
            where: { houseId: houseId }
        });

        res.status(200).json(sensors);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ดึงข้อมูลเซนเซอร์ล้มเหลว" });
    }
};

export const createSensor = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.UserId;

        if (!userId) {
            return res.status(401).json({ error: "ไม่พบข้อมูลผู้ใช้งานใน Token" });
        }

        const { houseId, serialNumber, name, type = "Fire & Gas" } = req.body;

        if (!houseId || !serialNumber || !name) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        const house = await prisma.house.findFirst({
            where: { id: String(houseId), userId: userId }
        });
        
        if (!house) return res.status(403).json({ error: "คุณไม่มีสิทธิ์เพิ่มเซนเซอร์ในบ้านหลังนี้" });

        const existingSensor = await prisma.sensor.findUnique({
            where: { serialNumber: String(serialNumber) }
        });
        
        if (existingSensor) return res.status(400).json({ error: "Sensor ID นี้ถูกเพิ่มในระบบแล้ว" });

        const newSensor = await prisma.sensor.create({
            data: {
                serialNumber: String(serialNumber),
                name: String(name),
                type: String(type),
                status: "waiting", 
                houseId: String(houseId)
            }
        });

        res.status(201).json({ msg: "เพิ่มเซนเซอร์สำเร็จ", sensor: newSensor });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "เพิ่มเซนเซอร์ล้มเหลว" });
    }
};