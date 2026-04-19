import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "ไม่อนุญาตให้เข้าถึง กรุณาล็อกอิน" });
    }
    try {
        const secret = process.env.JWT_SECRET || "defaultSecretKey";
        const decoded = jwt.verify(token, secret);
        req.user = decoded.user;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Token ไม่ถูกต้อง หรือหมดอายุ" });
    }
};
//# sourceMappingURL=authVerify.js.map