const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const generateContent = require('./akiHandler');

// Rate limiter setup - 10 requests per session per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // limit each session (req.sessionID) to 10 requests per minute
  keyGenerator: (req) => req.sessionID, // Use session ID as the key for rate limiting
  message: { error: "Too many requests from your session. Please slow down." },
  statusCode: 429
});

// Apply rate limiter to the /chat/erevuka route
router.post('/chat/aki', chatLimiter, generateContent);

module.exports = router;
