const express = require('express');
const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

let db;
if (isProduction) {
  // PostgreSQL
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // MySQL
  const mysql = require('mysql2');
  db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chatbot_db',
    port: process.env.DB_PORT || 3306
  });
}

// POST /api/saveMessage
router.post('/saveMessage', async (req, res) => {
  const { message, platform } = req.body;
  const sender = req.sessionID;
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  if (!message || !sender) {
    return res.status(400).json({ message: 'Message and sender are required.' });
  }

  const values = [message, sender, platform, ip];

  try {
    if (isProduction) {
      // PostgreSQL query (use $1, $2... for parameterized inputs)
      const query = `
        INSERT INTO messages (message, user_id, project, remote_ip)
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(query, values);
    } else {
      // MySQL query (use ? placeholders)
      const query = `
        INSERT INTO messages (message, user_id, project, remote_ip)
        VALUES (?, ?, ?, ?)
      `;
      db.query(query, values, (err) => {
        if (err) {
          console.error('Error saving message to MySQL:', err);
          return res.status(500).json({ message: 'Error saving message to database' });
        }
        return res.status(200).json({ message: 'Message saved successfully' });
      });
      return; // prevent sending two responses in dev
    }

    res.status(200).json({ message: 'Message saved successfully' });
  } catch (err) {
    console.error('Error saving message to PostgreSQL:', err);
    res.status(500).json({ message: 'Error saving message to database' });
  }
});

module.exports = router;
