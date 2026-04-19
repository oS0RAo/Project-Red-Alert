import { prisma } from "../../lib/prisma.js";
export const list = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, fullName: true, email: true }
        });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to list user" });
    }
};
export const remove = async (req, res) => {
    try {
        const { UserId } = req.params;
        const remove = await prisma.user.delete({
            where: { id: String(UserId) }
        });
        res.status(200).json({ msg: "Remove successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to remove user" });
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.UserId;
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                fullName: true,
                email: true,
                emergencyPhone: true,
                pushNotify: true
            }
        });
        if (!user)
            return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาด" });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const { emergencyPhone, pushNotify } = req.body;
        const userId = req.user.UserId;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { emergencyPhone, pushNotify }
        });
        res.json({ msg: "อัปเดตเบอร์ติดต่อฉุกเฉินสำเร็จ", user: updatedUser });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "ไม่สามารถอัปเดตโปรไฟล์ได้" });
    }
};
export const savePushToken = async (req, res) => {
    try {
        const { expoPushToken } = req.body;
        const userId = req.user.UserId;
        await prisma.user.update({
            where: { id: userId },
            data: { expoPushToken: expoPushToken }
        });
        res.json({ msg: "บันทึก Push Token สำเร็จ" });
    }
    catch (error) {
        console.log("Error saving push token:", error);
        res.status(500).json({ error: "ไม่สามารถบันทึก Push Token ได้" });
    }
};
//# sourceMappingURL=user.js.map