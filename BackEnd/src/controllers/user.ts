import express, { Request, Response } from "express";

export const user = (req: Request, res: Response) => {
    res.send('Hello User');
}

