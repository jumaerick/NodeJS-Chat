// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Import route modules for specific endpoints
const geminiRoutes = require('./routes/gemini_routes/gemini'); // for Gemini general chat
const erevukaRoutes = require('./routes/erevuka_routes/erevuka'); // for Erevuka-specific chat
const akiRoutes = require('./routes/aki_routes/aki'); // for Erevuka-specific chat
const messageRoutes = require('./routes/message');

// === Conditional session store setup ===
let sessionStore;

if (process.env.NODE_ENV === 'production') {
  // PostgreSQL (Render)
  const pgSession = require('connect-pg-simple')(session);
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  sessionStore = new pgSession({
    pool,
    tableName: 'session'
  });

  console.log('Using PostgreSQL session store (production)');
} else {
  // MySQL (local dev)
  const MySQLStore = require('express-mysql-session')(session);

  sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chatbot_db',
    port: process.env.DB_PORT || 3306
  });

  console.log('Using MySQL session store (development)');
}

// Configure CORS and allowed origins
const allowedOrigins = [
  'https://courses.erevuka.org',
  'https://erevuka-chat.onrender.com',
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

// Trust proxy (important for secure cookies behind proxies like Render)
app.set('trust proxy', 1);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret-session-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Route usage
app.use('/api', erevukaRoutes);
app.use('/api', geminiRoutes);
app.use('/api', akiRoutes);
app.use('/api', messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
