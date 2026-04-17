import express from "express";
import { prisma } from "../lib/prisma.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET;
const geminiApiKey = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Hello, From Prisma API Naraak mak mak!!!");
});


const routePath = path.join(__dirname, 'routes'); 

readdirSync(routePath).forEach((rf) => {
    const route = require(path.join(routePath, rf));
    const routerHandler = route.default || route;
    
    if (typeof routerHandler === 'function') {
        app.use('/api', routerHandler);
        console.log(`Loaded route: ${rf}`);
    } else {
        console.error(`Fail to load route ${rf}: Not a function`);
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});