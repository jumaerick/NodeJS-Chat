const express = require("express");
const router = express.Router();
var mysql = require("mysql2/promise");

const isDevelopment = process.env.NODE_ENV === "development";

let db;
// if (isProduction) {

// } else {
//   // MySQL
//   var con = mysql.createConnection({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "chatbot_db",
//     port: process.env.DB_PORT || 3306,
//   });
// }

// POST /api/saveMessage
router.post("/saveMessage", async (req, res) => {
  const { message, platform } = req.body;
  const sender = req.sessionID;
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  if (!message || !sender) {
    return res
      .status(400)
      .json({ message: "Message and sender are required." });
  }

  const values = [message, sender, platform, ip];

  var con = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chatbot_db",
    port: process.env.DB_PORT || 3306,
  });

  try {
    if (isProduction) {
      // Ensure table exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          user_id TEXT NOT NULL,
          project TEXT,
          remote_ip TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
      await con.query(createTableQuery);
    }

    res.status(200).json({ message: "Message saved successfully" });
  } catch (err) {
    console.error("Error saving message to PostgreSQL:", err);
    res.status(500).json({ message: "Error saving message to database" });
  }
});

export default router;
