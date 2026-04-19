import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
const config = {
    jwtSecret: process.env.JWT_SECRET || "defaultSecretKey",
    port: process.env.PORT || 5000
};
export const register = async (req, res) => {
    try {
        const { fullName, password, email } = req.body;
        const checkUser = await prisma.user.findUnique({
            where: { email: email }
        });
        if (checkUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userData = {
            fullName: fullName,
            email: email,
            password: hashedPassword
        };
        const newUser = await prisma.user.create({
            data: userData,
            select: {
                id: false,
                fullName: true,
                email: true
            }
        });
        res.status(201).json({
            msg: "Register successfully",
            newUser: newUser
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to register" });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. ค้นหา User
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user)
            return res.status(401).json({ msg: "Email or password is incorrect" });
        // 2. เช็ครหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Password is incorrect" });
        }
        // 3. สร้าง Token (แนะนำให้แก้จาก 10m เป็น 7d หรือ 30d สำหรับแอปมือถือครับ)
        const payload = { user: { UserId: user.id, email: user.email } };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
        // 🟢 4. คัดกรองข้อมูลก่อนส่งกลับ (ห้ามส่ง Password เด็ดขาด!)
        const safeUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            emergencyPhone: user.emergencyPhone, // 👈 ส่งเบอร์โทรกลับไปให้แอป
            pushNotify: user.pushNotify, // 👈 ส่งสถานะแจ้งเตือนกลับไป
            expoPushToken: user.expoPushToken // เผื่อไว้ใช้ตอนทำระบบ Push
        };
        // ส่งข้อมูลที่ปลอดภัยกลับไป
        res.status(200).json({ token, user: safeUser });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Fail to login" });
    }
};
//# sourceMappingURL=auth.js.map