import { Express, Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
    user?: { userId: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        if(!token) {
            return res.status(401).json({ msg: "Invalid token format" });
        }

        const decoded = verifyToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ msg: "Unauthorized" });
    }
}

export const registerMiddleware = (req: Request , res: Response, next: NextFunction) => {
<<<<<<< HEAD
<<<<<<< HEAD
    const { fullName, password, email } = req.body;
    if (!fullName || !password || !email) {
        return res.status(400).json({ error: "All fields are required" });
    } 
    next();
}
=======
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
    try {
        const { fullName, password, email } = req.body;
        const checkUser = false; // Replace with actual user lookup logic
        if (!fullName || !password || !email) {
            return res.status(400).json({ error: "All fields are required" });
        } 
        if (checkUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to register" });
    }
} 
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b

export const loginMiddleware = (req: Request , res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    } 
    next();
}