import express from "express";
import cors from "cors";
import analysisRoutes from "./routes/analysisroutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analysis", analysisRoutes);

export default app;
