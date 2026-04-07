import { Express, Request, Response, NextFunction } from "express";

export const registerMiddleware = (req: Request , res: Response, next: NextFunction) => {
    const { fullName, password, email } = req.body;
    const checkUser = false; // Replace with actual user lookup logic
    if (!fullName || !password || !email) {
        return res.status(400).json({ error: "All fields are required" });
    } 
    if (checkUser) {
        return res.status(400).json({ error: "Email already exists" });
    }
    next();
} 

export const loginMiddleware = (req: Request , res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    } 
    next();
}