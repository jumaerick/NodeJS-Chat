// routes/message.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Use a connection pool (recommended over a single connection)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'chatbot_db'
});

// POST /api/saveMessage
router.post('/saveMessage', (req, res) => {
  const { message, platform } = req.body;
  const sender = req.sessionID;
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Normalize localhost IP
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  // Validate input
  if (!message || !sender) {
    return res.status(400).json({ message: 'Message and sender are required.' });
  }

  const query = 'INSERT INTO messages (message, user_id, project, remote_ip) VALUES (?, ?, ?, ?)';
  db.query(query, [message, sender, platform, ip], (err) => {
    if (err) {
      console.error('Error saving message to MySQL:', err);
      return res.status(500).json({ message: 'Error saving message to database' });
    }

    res.status(200).json({ message: 'Message saved successfully' });
  });
});

module.exports = router;
