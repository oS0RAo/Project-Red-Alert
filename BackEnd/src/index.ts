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

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
const routePath = path.join(__dirname, "routes");

// load routes (ESM)
for (const rf of readdirSync(routePath)) {
  const routeFile = path.join(routePath, rf);
  const route = await import(pathToFileURL(routeFile).href);
  app.use("/api", route.default);
}
<<<<<<< HEAD
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b
=======
>>>>>>> bec6f4d4896842624e87e788103dd9509eedde9b

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});