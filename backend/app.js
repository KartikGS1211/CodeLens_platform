import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./utils/auth.js";
import authRoutes from "./routes/authroutes.js";
import analysisRoutes from "./routes/analysisroutes.js";

const app = express();

const allowedOrigins = [
  "https://codelens-platform-new.onrender.com",
  "https://code-lens-platform.vercel.app",
  "http://localhost:4321",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4322",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// Configure express session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "codelens-secret-key-session-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);

export default app;
