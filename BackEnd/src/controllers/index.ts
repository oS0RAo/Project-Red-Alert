import express from 'express';
import { prisma } from "../lib/prisma"
 
const app = express();
const port = process.env.PORT || 2077;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('From API Port: 2077')
});

app.post('/register/users', (req, res) => {
    const newUser = req.body
    
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost${port}`);
});