import express from 'express';
import { prisma } from "../lib/prisma"
import controllerRoutes from "./controllers"; 

const app = express();
const port = process.env.PORT || 2077;

app.use(express.json());

app.use('/api', controllerRoutes);

app.post('/register/users', (req, res) => {
    const newUser = req.body
    
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost${port}`);
});