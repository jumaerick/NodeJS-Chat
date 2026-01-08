import mysql from "mysql2";
import dotenv from "dotenv";
import session from "express-session";
import expressMySQLSession from "express-mysql-session";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";

dotenv.config();

const isTesting = process.env.NODE_ENV === "testing";

// ===============================
// DATABASE CONNECTIONS
// ===============================

// MySQL (local / production)
const mysqlDb = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// PostgreSQL (testing / Render)
const { Pool } = pkg;
const pgDb = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ===============================
// SESSION STORE
// ===============================

let sessionStore;
const MySQLStore = expressMySQLSession(session);

if (isTesting) {
  const PgSessionStore = connectPgSimple(session);

  sessionStore = new PgSessionStore({
    pool: pgDb,
    tableName: "session",
    createTableIfMissing: true,
  });

  console.log("Using PostgreSQL session store (testing)");
} else {
  sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chatbot_db",
    port: process.env.DB_PORT || 3306,
  });

  console.log("Using MySQL session store (dev/prod)");
}

// ===============================
// EXPORTS
// ===============================
export { mysqlDb, pgDb, sessionStore };
