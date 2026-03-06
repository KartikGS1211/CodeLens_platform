import express from "express";
import cors from "cors";
import analysisRoutes from "./routes/analysisroutes.js";

const app = express();

app.use(cors(
    {
    origin: [
      "http://localhost:5173",
      "https://codelens-ai-752d.onrender.com"
    ],
  }
));
app.use(express.json());

app.use("/api/analysis", analysisRoutes);

export default app;
