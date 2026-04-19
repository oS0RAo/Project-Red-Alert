import { prisma } from '../../lib/prisma';
export const getHistory = async (req, res) => {
    try {
        const logs = await prisma.eventLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                sensor: {
                    select: { name: true, serialNumber: true }
                }
            }
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลประวัติได้" });
    }
};
//# sourceMappingURL=history.js.map