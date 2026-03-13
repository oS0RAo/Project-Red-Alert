import express, { Response, Request } from 'express';

export const register = (req: Request, res: Response) => {
    res.send('Hello Create Register');
};

export const login = (req: Request, res: Response) => {
    res.send('Hello Login');
};