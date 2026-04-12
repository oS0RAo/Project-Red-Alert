import express from 'express';
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import { readdir, readdirSync } from 'fs';
import path from 'path';
import cors from 'cors';
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
    res.send('Hello, From Prisma API!?');
});

const routePath = path.join(__dirname, 'routes'); // read all files in routes folder and use them as routes
readdirSync(routePath).map((rf) => // rf => read file in routes folder
    app.use('/api', require(path.join(routePath, rf)))
) 




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});