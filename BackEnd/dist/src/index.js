import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import houseRoutes from './routes/house';
import sensorRoutes from './routes/sensor';
import historyRoutes from './routes/history';
import userRoutes from './routes/user';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get('/test', (req, res) => {
    res.send('Hello, From Prisma API!');
});
app.use('/api', authRoutes);
app.use('/api', houseRoutes);
app.use('/api', sensorRoutes);
app.use('/api', historyRoutes);
app.use('/api/user', userRoutes);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map