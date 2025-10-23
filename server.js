// server.js
import dotenv from "dotenv";
import express from "express";
import path from "path";
import cors from "cors";
import session from "express-session";
import expressMySQLSession from "express-mysql-session";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";
import { fileURLToPath } from "url";

// Fix __dirname and __filename for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Conditional session store setup ===
let sessionStore;
const MySQLStore = expressMySQLSession(session);

if (process.env.NODE_ENV === "testing") {
  // PostgreSQL (Render)
  const { Pool } = pkg;
  const pgSession = connectPgSimple(session);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  sessionStore = new pgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true,
  });

  console.log("Using PostgreSQL session store (production)");
} else {
  // MySQL (local dev)
  // console.log(process.env.DB_PASSWORD);
  sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chatbot_db",
    port: process.env.DB_PORT || 3306,
  });

  console.log("Using MySQL session store (development)");
}

// === Routes ===
// Uncomment or add these once the files exist
import geminiRoutes from "./routes/gemini_routes/gemini.js";
import erevukaRoutes from "./routes/erevuka_routes/erevuka.js";
import akiRoutes from "./routes/aki_routes/aki.js";
import messageRoutes from "./routes/message.js";

// === CORS setup ===
const allowedOrigins = [
  "https://courses.erevuka.org",
  "https://erevuka-chat.onrender.com",
  "https://apps.courses.farwell-consultants.com",
  "https://courses.farwell-consultants.com",
  "https://courses.akinsure.com",
  "https://apps.courses.akinsure.com",
  "https://api.erevuka.org",
  "http://localhost:1000",
  "http://localhost:3000",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// === Middleware ===
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1);

// === Session ===
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-session-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// === Route usage ===
app.use("/api", geminiRoutes);
app.use("/api", erevukaRoutes);
app.use("/api", akiRoutes);
app.use("/api", messageRoutes);

// === Root route ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Global error handler ===
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
