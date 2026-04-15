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

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Hello, From Prisma API!?");
});

const routePath = path.join(__dirname, "routes");

// load routes (ESM)
for (const rf of readdirSync(routePath)) {
  const routeFile = path.join(routePath, rf);
  const route = await import(pathToFileURL(routeFile).href);
  app.use("/api", route.default);
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});