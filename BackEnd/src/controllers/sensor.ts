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
};