import dotenv from "dotenv";
dotenv.config();

import app from "./app.js"; 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);

  console.log('Database connected successfully');

  console.log("GROG EVALUATION SUCCESSFULLY", !!process.env.GROQ_API_KEY);

  console.log("GITHUB TOKEN EXISTS:", !!process.env.GITHUB_TOKEN);
});
