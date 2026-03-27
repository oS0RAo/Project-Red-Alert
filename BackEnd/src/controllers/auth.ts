import express, { Response, Request } from 'express';

export const register = (req: Request, res: Response) => {
    const { user, password, email } = req.body
    try {
        console.log(user, password, email);
        res.json({ user, password, email });
    } catch (error) {
        res.status(500).json({ error: "fail" });
    }
};

export const login = (req: Request, res: Response) => {
    res.send('Hello Login');
};