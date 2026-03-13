import express from 'express';
import { prisma } from '../lib/prisma';
import { readdirSync } from 'fs';
import path from 'path';

const cors = ('cors');
const app = express();
const port = process.env.PORT || 5000;


app.use(express.json());

//---> Test API
app.get('/api', (req, res) => {
    res.send('From Red')
});

//---> Routes
const routePath = path.join(__dirname, 'routes');
readdirSync(routePath).map((rf) => 
    app.use('/api', require(path.join(routePath, rf)))
)

//---> Run Server Port: 5000 
app.listen(port, ()=> {
    console.log(`Server is running on http://localhost:${port}`);
})