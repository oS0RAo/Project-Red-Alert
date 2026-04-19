import express from 'express';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../Middleware/authVerify';
const router = express.Router();
// รับข้อมูลจากบอร์ด
router.post('/sensors/data', async (req, res) => {
    try {
        const { serialNumber, temp, gas } = req.body;
        const sensor = await prisma.sensor.findUnique({ where: { serialNumber } });
        if (!sensor)
            return res.status(404).json({ error: "ไม่พบอุปกรณ์ในระบบ" });
        let newStatus = "Online";
        let isDanger = false;
        if (temp > 50 || gas > 400) {
            newStatus = "Danger";
            isDanger = true;
        }
        const updatedSensor = await prisma.sensor.update({
            where: { serialNumber },
            data: { temp, gas, status: newStatus }
        });
        if (isDanger && sensor.status !== "Danger") {
            await prisma.eventLog.create({
                data: {
                    type: "CRITICAL",
                    title: "🚨 แจ้งเตือนเหตุฉุกเฉิน!",
                    details: `อุปกรณ์: ${sensor.name} ตรวจพบ อุณหภูมิ ${temp}°C, แก๊ส ${gas} PPM (ค่าสูงเกินมาตรฐาน)`,
                    sensorId: sensor.id
                }
            });
        }
        res.json({ msg: "อัปเดตสำเร็จ", sensor: updatedSensor });
    }
    catch (error) {
        console.error("Update data error:", error);
        res.status(500).json({ error: "อัปเดตล้มเหลว" });
    }
});
// เพิ่มอุปกรณ์ใหม่
router.post('/sensors', verifyToken, async (req, res) => {
    try {
        const { houseId, serialNumber, name, type } = req.body;
        const existingSensor = await prisma.sensor.findUnique({ where: { serialNumber } });
        if (existingSensor)
            return res.status(400).json({ error: "Serial Number นี้ถูกลงทะเบียนไปแล้ว" });
        const result = await prisma.$transaction(async (tx) => {
            const newSensor = await tx.sensor.create({
                data: {
                    serialNumber,
                    name,
                    type: type || "Fire & Gas",
                    status: "Waiting",
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
    }
    catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มเซนเซอร์" });
    }
});
// ลบอุปกรณ์
router.delete('/sensors/:id', verifyToken, async (req, res) => {
    try {
        const sensorId = req.params.id;
        const sensor = await prisma.sensor.findUnique({ where: { id: sensorId } });
        if (!sensor)
            return res.status(404).json({ error: "ไม่พบอุปกรณ์" });
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
    }
    catch (error) {
        res.status(500).json({ error: "ลบข้อมูลล้มเหลว" });
    }
});
export default router;
//# sourceMappingURL=sensor.js.map