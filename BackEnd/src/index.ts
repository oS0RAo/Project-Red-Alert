import express from 'express';

const app = express();
const port = process.env.PORT || 2077;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('From API Port: 2077')
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost${port}`);
});