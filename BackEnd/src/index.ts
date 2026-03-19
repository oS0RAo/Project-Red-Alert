import express from 'express';
import { prisma } from '../lib/prisma';
import { readdir, readdirSync } from 'fs';
import path from 'path';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, From Prisma API!?');
});

const routePath = path.join(__dirname, 'routes');
readdirSync(routePath).map((rf) => 
    app.use('/api', require(path.join(routePath, rf)))
) 

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});