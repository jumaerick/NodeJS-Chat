import express from "express";
import { db } from "../config/db.js";
import { createChatLog } from "../models/chatLogModel.js"; // Use the model directly

const router = express.Router();
const isTesting = process.env.NODE_ENV === "testing";
console.log(isTesting, 'hapa');

let mysqlPromise;
if (!isTesting) {
  mysqlPromise = db.promise(); // promise wrapper for MySQL
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

  try {
    let newLog;

    if (isTesting) {
      // === PostgreSQL ===
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
      console.log('will store in postgress');
      await db.query(createTableQuery);

      // Insert using model function
      newLog = await createChatLog(message, sender, platform, ip, "postgresql");

      return res.status(200).json({
        message: "Message saved successfully (PostgreSQL)",
        data: newLog,
      });
    } else {
      // === MySQL ===
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

      // Insert using model function
      newLog = await createChatLog(message, sender, platform, ip, "mysql");

      return res.status(200).json({
        message: "Message saved successfully (MySQL)",
        data: newLog,
      });
    }
  } catch (err) {
    console.error("Error saving message:", err);
    return res.status(500).json({ message: "Error saving message to database" });
  }
});

export default router;
