import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { analyzeSensorData } from '../services/ai_service.js';

export const createSensorData = async (req: Request, res: Response) => {
  try {
    const { sensorId, gas, temperature, humidity, smoke } = req.body;

    const data = await prisma.sensorData.create({
      data: {
        sensorId,
        gas,
        temperature,
        humidity,
        smoke,
      },
    });

    let status = "normal";

    if (gas > 400) {
      status = "gas_leak";
    } else if (temperature > 80 && smoke > 200) {
      status = "fire";
    } else if (temperature > 50) {
      status = "cooking";
    } else {
      status = await analyzeSensorData({
        temperature,
        gas,
        smoke,
      });
    }

    const validStatus = ["normal", "fire", "gas_leak", "cooking"];
    if (!validStatus.includes(status)) {
      status = "normal";
    }

    await prisma.sensor.update({
      where: { SensorNumber: sensorId },
      data: { status },
    });

    res.json({
      success: true,
      data,
      status,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert sensor data failed" });
  }
};