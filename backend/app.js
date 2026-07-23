import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./utils/auth.js";
import authRoutes from "./routes/authroutes.js";
import analysisRoutes from "./routes/analysisroutes.js";

const app = express();

// Trust Render/Heroku/etc reverse proxy so req.secure = true behind HTTPS
// Without this, cookies with `secure: true` are NEVER sent by the browser
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://code-lens-platform.vercel.app",
  "http://localhost:4321",
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

// Disable caching for api requests (Fixes 304 Not Modified issue on /me in prod)
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// Build session store — use Postgres in production, memory in dev
const isProduction = process.env.NODE_ENV === "production";

let sessionStore;
if (isProduction && process.env.DATABASE_URL) {
  const PgSession = connectPgSimple(session);
  sessionStore = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: "user_sessions", // auto-created on first run
    createTableIfMissing: true,
  });
}

// Configure express session middleware
app.use(
  session({
    store: sessionStore, // undefined in dev → MemoryStore (fine for local)
    secret: process.env.SESSION_SECRET || "codelens-secret-key-session-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // HTTPS-only in prod
      sameSite: isProduction ? "none" : "lax", // cross-site in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
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
