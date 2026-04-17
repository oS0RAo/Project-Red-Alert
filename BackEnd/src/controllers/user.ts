import express, { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const list = async(req: Request, res: Response): Promise<any> => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, fullName: true, email: true }
         });
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to list user" });
    }
}

export const remove = async (req: Request, res: Response): Promise<any> => {
    try {
        const { UserId } = req.params;
        
        const remove = await prisma.user.delete({
            where: { id: String(UserId) } 
        })
        res.status(200).json({ msg: "Remove successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Fail to remove user" });
    }
}