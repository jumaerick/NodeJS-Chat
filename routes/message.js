import express from "express";
import pkg from "pg";
import mysql from "mysql2";

const router = express.Router();

const isDevelopment = process.env.NODE_ENV === "development";

let db;
let mysqlPromise;

if (isDevelopment) {
  // === PostgreSQL ===
  const { Pool } = pkg;
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // === MySQL ===
  db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chatbot_db",
    port: process.env.DB_PORT || 3306,
  });

  // use promise wrapper for async/await
  mysqlPromise = db.promise();
}

// === POST /api/saveMessage ===
router.post("/saveMessage", async (req, res) => {
  const { message, platform } = req.body;
  const sender = req.sessionID;
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";

  if (!message || !sender) {
    return res.status(400).json({ message: "Message and sender are required." });
  }

  const values = [message, sender, platform, ip];

  try {
    if (isDevelopment) {
      // === Ensure messages table exists (PostgreSQL) ===
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS chatbot_logs (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          user_id TEXT NOT NULL,
          project TEXT,
          remote_ip TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      await db.query(createTableQuery);

      // === Insert into PostgreSQL ===
      const insertQuery = `
        INSERT INTO chatbot_logs (message, user_id, project, remote_ip)
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(insertQuery, values);
      return res.status(200).json({ message: "Message saved successfully (PostgreSQL)" });

    } else {
      //Ensure chatbot_logs table exists (MySQL) ===
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS chatbot_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message TEXT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          project VARCHAR(255),
          remote_ip VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await mysqlPromise.query(createTableQuery);

      // Insert into MySQL ===
      const insertQuery = `
        INSERT INTO chatbot_logs (message, user_id, project, remote_ip)
        VALUES (?, ?, ?, ?)
      `;
      await mysqlPromise.query(insertQuery, values);

      console.log("Message saved to MySQL");
      return res.status(200).json({ message: "Message saved successfully (MySQL)" });
    }
  } catch (err) {
    console.error("Error saving message:", err);
    return res.status(500).json({ message: "Error saving message to database" });
  }
});

export default router;
