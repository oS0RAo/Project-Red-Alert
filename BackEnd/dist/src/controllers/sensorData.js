import { prisma } from "../../lib/prisma.js";
import { analyzeSensorData } from '../services/ai_service.js';
import { sendPushNotification } from '../utils/expoPush.js';
export const createSensorData = async (req, res) => {
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
        }
        else if (temperature > 80 && smoke > 200) {
            status = "fire";
        }
        else if (temperature > 50) {
            status = "cooking";
        }
        else {
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
        const updatedSensor = await prisma.sensor.update({
            where: { serialNumber: String(sensorId) },
            data: {
                status: status,
                temp: temperature,
                gas: gas
            },
            include: {
                house: {
                    include: { user: true }
                }
            }
        });
        if (status === "fire" || status === "gas_leak") {
            const owner = updatedSensor.house.user;
            if (owner.pushNotify === true && owner.expoPushToken) {
                const alertTitle = status === "fire" ? "RED ALERT: ไฟไหม้/ควันหนาแน่น!" : "RED ALERT: แก๊สรั่วไหล!";
                const alertBody = `เซนเซอร์ "${updatedSensor.name}" ตรวจพบค่าอันตราย (แก๊ส: ${gas}, อุณหภูมิ: ${temperature}) กรุณาตรวจสอบด่วน!`;
                await sendPushNotification(owner.expoPushToken, alertTitle, alertBody);
                console.log(`ส่งแจ้งเตือนฉุกเฉินไปที่มือถือของคุณ ${owner.fullName} สำเร็จ`);
            }
            else {
                console.log(`ไม่ได้ส่งแจ้งเตือน: ผู้ใช้ปิด Push ไว้ หรือยังไม่ได้ล็อกอินแอป`);
            }
        }
        res.json({
            success: true,
            data,
            status,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Insert sensor data failed" });
    }
};