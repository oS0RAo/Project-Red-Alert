// src/controllers/sensorData.ts
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

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

    // 🔥 AI logic (simple rule)
    let status = "normal";
    if (gas > 300) status = "gas_leak";
    else if (smoke > 200) status = "fire";
    else if (temperature > 50) status = "cooking";

    await prisma.sensor.update({
      where: { SensorNumber: sensorId },
      data: { status },
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Insert sensor data failed" });
  }
};