const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // Optional: for production session storage

const generateContent = require('./routes/gemini.js'); // AI logic handler
const app = express();
const PORT = process.env.PORT || 3000;

// 
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'chatbot_db'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// 
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

app.use(cors(corsOptions));
app.use(express.json());

// \
const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'root',
  database: 'chatbot_db'
});

// \
app.use(
  session({
    secret: 'super-secret-session-key', // use process.env.SESSION_SECRET in production
    resave: false,
    saveUninitialized: true, // or false in prod for privacy
    cookie: {
      secure: false, // true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    },
    // store: sessionStore // Uncomment for persistent sessions
  })
);

// \
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//
app.post('/saveMessage', (req, res) => {
  const { message} = req.body;
  const sender = req.sessionID;  // Use the session ID as the sender
  const project = req.headers.origin;
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
  ip = '127.0.0.1';
}

  if (!message || !sender) {
    return res.status(400).send({ message: 'Message and sender are required.' });
  }

  const query = 'INSERT INTO messages (message, user_id, project, remote_ip) VALUES (?, ?, ?, ?)';
  db.query(query, [message, sender, project, ip], (err, result) => {
    if (err) {
      console.error('Error saving message to MySQL:', err);
      return res.status(500).send({ message: 'Error saving message to database' });
    }
    res.status(200).send({ message: 'Message saved successfully' });
  });
});

//
app.post('/api/chat', generateContent);

//
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
