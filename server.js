// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
const PORT = process.env.PORT || 3000;

// Import route modules for specific endpoints
const geminiRoutes = require('./routes/gemini_routes/gemini'); // for Gemini general chat
const erevukaRoutes = require('./routes/erevuka_routes/erevuka'); // for Erevuka-specific chat
const messageRoutes = require('./routes/message');

// Configure MySQL session store
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'chatbot_db'
});

// Configure CORS and allowed origins
const allowedOrigins = [
  'https://courses.erevuka.org',
  'https://nodejs-chat-fi0c.onrender.com',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxy (important for secure cookies and IP tracking behind reverse proxies)
app.set('trust proxy', 1);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret-session-key',
    resave: false,
    saveUninitialized: false, // safer for production
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true if HTTPS in production
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Route usage
app.use('/api', erevukaRoutes);
app.use('/api', geminiRoutes);
app.use('/api', messageRoutes);
      // /api/chat/erevukae

// Root route (serves index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler (optional but good practice)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
