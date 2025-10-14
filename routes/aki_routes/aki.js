// routes/aki_routes/aki.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import generateContent from './akiHandler.js';

const router = express.Router();

// Rate limiter setup - 5 requests per session per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5,
  keyGenerator: (req) => req.sessionID, // Use session ID for rate limiting
  message: { error: "Too many requests from your session. Please slow down." },
  statusCode: 429,
});

// Apply rate limiter to /chat/aki route
router.post('/chat/aki', chatLimiter, generateContent);

// Export router as default (required for ESM import)
export default router;
