import express from 'express';
import { prisma } from '../../lib/prisma.js';
import { verifyToken } from '../Middleware/authVerify.js';
import { sendEmergencyPush } from '../utils/pushNotify.js'; 
import { analyzeSensorData } from '../services/ai_service.js';

const router = express.Router();

// รับข้อมูลจากบอร์ด
router.post('/sensors/data', async (req, res) => {
  try {
    const serialNumber = req.body.serialNumber;
    const temp = req.body.temp || req.body.temperature || 0;
    const humidity = req.body.humidity || req.body.hum || 0;
    const gasValue = req.body.gasValue || req.body.gas || 0;

    // ลบ Console.log ออกเพื่อไม่ให้รก Terminal บน Server (หรือจะเปิดไว้ดูตอนเทสก็ได้ครับ)
    // console.log(`[DEBUG] ข้อมูลจากบอร์ด -> Temp: ${temp}, Hum: ${humidity}, Gas: ${gasValue}`);

    const sensor = await prisma.sensor.findUnique({ where: { serialNumber } });
    if (!sensor) return res.status(404).json({ error: "ไม่พบอุปกรณ์ในระบบ" });

    let newStatus = "normal"; 
    let isDanger = false;

    // ด่านอันตรายรุนแรงแจ้งเตือนทันที ไม่ต้องรอ AI
    if (temp > 60 && gasValue > 400) {
      newStatus = "fire"; 
      isDanger = true;
    } else if (gasValue > 450) {
      newStatus = "gasleak"; 
      isDanger = true;
    } 
    // ด่านปกติถ้าอากาศเย็นสบาย ควันไม่มี ไม่ต้องใช้ AI ประหยัดโควต้า
    else if (temp < 38 && humidity < 70 && gasValue < 120) {
      newStatus = "normal";
    }
    // ด่านก้ำกึ่ง ถ้าร้อนผิดปกติ หรือเริ่มมีควัน ค่อยให้ AI มาช่วยวิเคราะห์
    else {
      newStatus = await analyzeSensorData({
        temperature: temp,
        humidity: humidity,
        gasValue: gasValue
      });

      // กัน AI หลอน
      const validStatuses = ["normal", "cooking", "fire", "gasleak"];
      if (!validStatuses.includes(newStatus)) {
        newStatus = "normal";
      }

      if (newStatus === "fire" || newStatus === "gasleak") {
        isDanger = true;
      }
    }

    // อัปเดตข้อมูลสถานะล่าสุดลงตาราง Sensor
    const updatedSensor = await prisma.sensor.update({
      where: { serialNumber },
      data: { 
        temp: temp, 
        humidity: humidity, 
        gasValue: gasValue, 
        status: newStatus 
      }
    });

    // บันทึกประวัติลงตาราง SensorData
    await prisma.sensorData.create({
      data: {
        sensorId: sensor.id,
        temp: temp,
        humidity: humidity,
        gasValue: gasValue
      }
    });

    // ถ้าตรวจพบอันตราย และสถานะก่อนหน้านี้ยังไม่ใช่ไฟไหม้/แก๊สรั่ว (กันการยิงแจ้งเตือนซ้ำรัวๆ)
    if (isDanger && (sensor.status !== "fire" && sensor.status !== "gasleak")) {
      
      // บันทึก Log ของระบบ
      await prisma.eventLog.create({
        data: {
          type: "CRITICAL",
          title: "แจ้งเตือนเหตุฉุกเฉิน!",
          details: `อุปกรณ์: ${sensor.name} ตรวจพบ อุณหภูมิ ${temp}°C, แก๊ส/ควัน ${gasValue} PPM (สถานะ: ${newStatus})`,
          sensorId: sensor.id
        }
      });

      const house = await prisma.house.findUnique({
        where: { id: sensor.houseId },
        include: { user: true }
      });

      const owner = house?.user; 
      if (owner) {
        
        // บันทึกลงตาราง Notification
        const alertTitle = newStatus === "fire" ? "RED ALERT: ไฟไหม้!" : "RED ALERT: แก๊สรั่ว!";
        const alertMessage = `อุปกรณ์ "${sensor.name}" ตรวจพบค่าอันตราย (อุณหภูมิ ${temp}°C, แก๊ส/ควัน ${gasValue} PPM) กรุณาตรวจสอบด่วน!`;

        await prisma.notification.create({
          data: {
            title: alertTitle,
            message: alertMessage,
            userId: owner.id,
            isRead: false
          }
        });

        // ส่ง Push Notification เข้าหน้าจอมือถือ
        if (owner.expoPushToken && owner.pushNotify === true) {
          console.log(`กำลังส่งแจ้งเตือนด่วนไปยังมือถือของ: ${owner.fullName}`);
          await sendEmergencyPush(owner.expoPushToken, sensor.name);
        } else {
          console.log("ไม่สามารถส่งแจ้งเตือนได้: ไม่มี Token หรือผู้ใช้ปิดการแจ้งเตือนไว้");
        }
      }
    }

    res.json({ msg: "อัปเดตสำเร็จ", sensor: updatedSensor });
  } catch (error) {
    console.error("Update data error:", error);
    res.status(500).json({ error: "อัปเดตล้มเหลว" });
  }
});

// เพิ่มอุปกรณ์ใหม่
router.post('/sensors', verifyToken, async (req, res) => {
  try {
    const { houseId, serialNumber, name, type } = req.body;

    const existingSensor = await prisma.sensor.findUnique({ where: { serialNumber } });
    if (existingSensor) return res.status(400).json({ error: "Serial Number นี้ถูกลงทะเบียนไปแล้ว" });

    const result = await prisma.$transaction(async (tx) => {
      const newSensor = await tx.sensor.create({
        data: {
          serialNumber,
          name,
          type: type || "Fire & Gas",
          status: "waiting", // ใช้พิมพ์เล็กให้ตรงกับฝั่งหน้าบ้าน
          houseId: houseId,
        }
      });

      await tx.eventLog.create({
        data: {
          type: "INFO",
          title: "เพิ่มเซนเซอร์ใหม่",
          details: `เพิ่มอุปกรณ์: ${name} (S/N: ${serialNumber}) เข้าสู่ระบบสำเร็จ`,
          sensorId: newSensor.id
        }
      });
      return newSensor;
    });

    res.status(201).json({ msg: "เพิ่มเซนเซอร์สำเร็จ", sensor: result });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มเซนเซอร์" });
  }
});

// ลบอุปกรณ์
router.delete('/sensors/:id', verifyToken, async (req, res) => {
  try {
    const sensorId = req.params.id as string;

    const sensor = await prisma.sensor.findUnique({ where: { id: sensorId } });
    if (!sensor) return res.status(404).json({ error: "ไม่พบอุปกรณ์" });

    await prisma.$transaction(async (tx) => {
      await tx.eventLog.create({
        data: {
          type: "WARNING",
          title: "ลบเซนเซอร์",
          details: `อุปกรณ์ ${sensor.name} (S/N: ${sensor.serialNumber}) ถูกลบออกจากระบบ`,
        }
      });
      await tx.sensor.delete({ where: { id: sensorId } });
    });

    res.json({ msg: "ลบเซนเซอร์สำเร็จ" });
  } catch (error) {
    res.status(500).json({ error: "ลบข้อมูลล้มเหลว" });
  }
});

export default router;