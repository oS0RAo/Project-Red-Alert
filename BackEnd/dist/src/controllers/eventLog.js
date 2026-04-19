import { prisma } from "../../lib/prisma.js";
export const createEventLog = async (req, res) => {
    try {
        const { sensorId, type, title, details } = req.body;
        const log = await prisma.eventLog.create({
            data: {
                sensorId,
                type,
                title,
                details,
            },
        });
        res.json(log);
    }
    catch (err) {
        res.status(500).json({ error: "Create log failed" });
    }
};
export const getLogs = async (req, res) => {
    try {
        const logs = await prisma.eventLog.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(logs);
    }
    catch (err) {
        res.status(500).json({ error: "Get logs failed" });
    }
};
//# sourceMappingURL=eventLog.js.map