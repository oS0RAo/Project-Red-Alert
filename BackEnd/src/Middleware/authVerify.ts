import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
    user?: { UserId: string, email: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): any => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: "ไม่อนุญาตให้เข้าถึง กรุณาล็อกอิน" });
    }

    try {
        const secret = process.env.JWT_SECRET || "defaultSecretKey";
        const decoded = jwt.verify(token, secret) as any;
        
        req.user = decoded.user; 
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token ไม่ถูกต้อง หรือหมดอายุ" });
    }
};