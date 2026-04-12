import express, { Response, Request } from 'express';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';


dotenv.config();
export const config = {
    jwtSecret: process.env.JWT_SECRET || "defaultSecretKey",
    port : process.env.PORT || 5000
}


export const register = async (req: Request, res: Response) => {
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
        }         
        const newUser = await prisma.user.create({
            data: userData,
            select: {
                UserId: false,
                fullName: true,
                email: true
            }
        });
        res.status(201).json({ msg: "Register successfully"});
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to register" });
    }
};

export const login = async(req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const  user = await prisma.user.findUnique({ 
            where: { email: email } 
        });
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                msg: "Password is incorrect"
             })
        }
        const payload = { user: { UserId: user.UserId, email: user.email }};
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '10m' });

        // console.log(token);
        res.status(200).json({ user:payload.user, token: token });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "Fail to login" });
    }
    
};