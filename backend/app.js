import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analysisroutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRoutes);

export default app;
