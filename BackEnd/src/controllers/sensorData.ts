import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { analyzeSensorData } from '../services/ai_service.js';
import { sendPushNotification } from '../utils/expoPush.js'; 

export const createSensorData = async (req: Request, res: Response) => {
  try {
    console.log("ข้อมูลดิบจาก ESP8266:", req.body);
    const { serialNumber, temp, humidity, gasValue } = req.body;

    const sensor = await prisma.sensor.findUnique({
      where: { serialNumber: String(serialNumber) },
      include: {
        house: {
          include: { user: true }
        }
      }
    });

    if (!sensor) {
      return res.status(404).json({ error: "ไม่พบเซนเซอร์นี้ในระบบ" });
    }

    const data = await prisma.sensorData.create({
      data: {
        sensorId: sensor.id, 
        temp: temp,
        humidity: humidity,
        gasValue: gasValue,
      },
    });

    let status = "normal";

    if (gasValue > 400 && temp <= 50) {
      status = "gasleak";
    } else if (temp > 70 && gasValue > 200) {
      status = "fire";
    } else if (temp > 45 && temp <= 70) {
      status = "cooking";
    } else {
      status = await analyzeSensorData({
        temperature: temp,
        humidity: humidity,
        gasValue: gasValue,
      });
    }

    const validStatuses = ["normal", "cooking", "fire", "gasleak"];
    if (!validStatuses.includes(status)) {
      status = "normal";
    }

    const updatedSensor = await prisma.sensor.update({
      where: { id: sensor.id },
      data: { 
        status: status,
        temp: temp,
        humidity: humidity,
        gasValue: gasValue 
      }
    });

    if (status === "fire" || status === "gasleak") {
        const owner = sensor.house.user;
        
        if (owner.pushNotify === true && owner.expoPushToken) {
            const alertTitle = status === "fire" ? "RED ALERT: ไฟไหม้/ควันหนาแน่น!" : "RED ALERT: แก๊สรั่วไหล!";
            const alertBody = `เซนเซอร์ "${sensor.name}" ตรวจพบค่าอันตราย (แก๊ส/ควัน: ${gasValue}, อุณหภูมิ: ${temp}°C) กรุณาตรวจสอบด่วน!`;
            
            await sendPushNotification(owner.expoPushToken, alertTitle, alertBody);
            console.log(`ส่งแจ้งเตือนฉุกเฉินไปที่มือถือของคุณ ${owner.fullName} สำเร็จ`);
        } else {
            console.log(`ไม่ได้ส่งแจ้งเตือน: ผู้ใช้ปิด Push ไว้ หรือยังไม่ได้ล็อกอินแอป`);
        }
    }

    res.json({
      success: true,
      data,
      status,
    });

  } catch (err) {
    console.error("❌ Insert sensor data failed:", err);
    res.status(500).json({ error: "Insert sensor data failed" });
  }
};