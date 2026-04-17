import express, { Response, Request } from 'express';
<<<<<<< HEAD
<<<<<<< HEAD
import prisma from '../../lib/prisma';
=======
import { prisma } from '../../lib/prisma.js';
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
import { prisma } from '../../lib/prisma.js';
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/jwt.js'; 


dotenv.config();
const config = {
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
<<<<<<< HEAD
<<<<<<< HEAD
                id: false,
=======
                UserId: true,
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
                UserId: true,
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
                fullName: true,
                email: true
            }
        });
        res.status(201).json({ 
            msg: "Register successfully",
            newUser: newUser
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to register" });
    }
};
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const  user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) return res.status(401).json({ msg: "Email or password is incorrect" });
        
        const isMatch = await bcrypt.compare(password, user.password);
<<<<<<< HEAD
<<<<<<< HEAD
        if (!isMatch) {
            return res.status(400).json({ 
                msg: "Password is incorrect"
             })
        }
        const payload = { user: { UserId: user.id, email: user.email }};
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '10m' });
=======
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
        if (!isMatch) return res.status(400).json({ msg: "Password is incorrect" });
        const token = generateToken(user.UserId);

        res.status(200).json({ token, user });
<<<<<<< HEAD
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b

        // console.log(token);
        
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "Fail to login" });
    }
    
};