import mysql from "mysql2";
import dotenv from "dotenv";
import session from "express-session";
import expressMySQLSession from "express-mysql-session";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";

//load dotenv environment
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

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

  console.log("Using PostgreSQL session store "+process.env.NODE_ENV);
} else {
  // MySQL (local dev and production)
//   console.log(process.env.DB_NAME);
  sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chatbot_db",
    port: process.env.DB_PORT || 3306,
  });

  console.log("Using MySQL session store "+process.env.NODE_ENV);
}

export { db, sessionStore };

