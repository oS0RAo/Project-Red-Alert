import { prisma } from "../../lib/prisma.js";
export const createHouse = async (req, res) => {
    try {
        const { name, address } = req.body;
        const house = await prisma.house.create({
            data: {
                name,
                address,
                userId: req.user.userId,
            },
        });
        res.json(house);
    }
    catch (err) {
        res.status(500).json({ error: "Create house failed" });
    }
};
export const getHouseById = async (req, res) => {
    try {
        const { houseId } = req.params;
        if (Array.isArray(houseId)) {
            return res.status(404).json({ error: "House not found" });
        }
        const house = await prisma.house.findFirst({
            where: {
                HouseId: houseId,
                userId: req.user.userId,
            },
            include: {
                sensors: true,
            },
        });
        res.json(house);
    }
    catch (err) {
        res.status(500).json({ error: "Get house failed" });
    }
};
export const deleteHouse = async (req, res) => {
    try {
        const { houseId } = req.params;
        if (Array.isArray(houseId)) {
            return res.status(404).json({ error: "House not found" });
        }
        await prisma.house.delete({
            where: { HouseId: houseId },
        });
        res.json({ message: "Deleted Success" });
    }
    catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
};
//# sourceMappingURL=%E0%B9%89house.js.map