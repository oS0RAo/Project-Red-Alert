<<<<<<< HEAD
<<<<<<< HEAD
import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../Middleware/authVerify';

export const listSensors = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const houseId = String(req.params.houseId);
        const userId = req.user?.UserId;

        const house = await prisma.house.findFirst({
            where: { id: houseId, userId: userId }
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
        
        const houseId = String(req.body.houseId);
        const serialNumber = String(req.body.serialNumber);
        const name = String(req.body.name);
        const type = req.body.type ? String(req.body.type) : "Fire & Gas";

        if (!req.body.houseId || !req.body.serialNumber || !req.body.name) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        const house = await prisma.house.findFirst({
            where: { id: houseId, userId: userId }
        });
        if (!house) return res.status(403).json({ error: "คุณไม่มีสิทธิ์เพิ่มเซนเซอร์ในบ้านหลังนี้" });

        const existingSensor = await prisma.sensor.findUnique({
            where: { serialNumber: serialNumber }
        });
        if (existingSensor) return res.status(400).json({ error: "Sensor ID นี้ถูกเพิ่มในระบบแล้ว" });

        const newSensor = await prisma.sensor.create({
            data: {
                serialNumber: serialNumber,
                name: name,
                type: type,
                status: "Waiting",
                houseId: houseId
            }
        });

        res.status(201).json({ msg: "เพิ่มเซนเซอร์สำเร็จ", sensor: newSensor });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "เพิ่มเซนเซอร์ล้มเหลว" });
    }
=======
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../Middleware/auth.js";

export const createSensor = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, houseId } = req.body;

    const sensor = await prisma.sensor.create({
      data: {
        name,
        type,
        houseId,
      },
    });

    res.json(sensor);
  } catch (err) {
    res.status(500).json({ error: "Create sensor failed" });
  }
};

export const getSensors = async (req: AuthRequest, res: Response) => {
  try {
    const { houseId } = req.params;
    if(Array.isArray(houseId)){
      return res.status(404).json({ error: "House not found" });
    }

    const sensors = await prisma.sensor.findMany({
      where: { houseId },
      include: {
        sensorData: true,
      },
    });

    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: "Get sensors failed" });
  }
};

export const updateSensorStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { sensorId } = req.params;
    const { status } = req.body;
    if(Array.isArray(sensorId)){
      return res.status(404).json({ error: "Sensor not found" });
    }

    const sensor = await prisma.sensor.update({
      where: { SensorNumber: sensorId },
      data: { status },
    });

    res.json(sensor);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
<<<<<<< HEAD
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
};