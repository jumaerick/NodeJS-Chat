const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'TestUser#', // Add your password if needed
  database: 'chatbot_db'
});

db.connect(err => {
  if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
  }
  console.log('Connected to MySQL');
});

const allowedOrigins = ['https://courses.erevuka.org'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // if you're using cookies/auth
};


app.use(cors(corsOptions));
app.use(express.json());


// Serve static files from the "public" directory
const generateContent = require("./routes/gemini.js");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/saveMessage', (req, res) => {

  const { message, sender } = req.body;

  // Validate input
  if (!message || !sender) {
      return res.status(400).send({ message: 'Message and sender are required.' });
  }


  // Insert the message into the database
  const query = 'INSERT INTO messages (message, sender) VALUES (?, ?)';
  db.query(query, [message, sender], (err, result) => {
      if (err) {
          console.error('Error saving message to MySQL:', err);
          return res.status(500).send({ message: 'Error saving message to database' });
      }
      res.status(200).send({ message: 'Message saved successfully' });
  });
});


app.post("/gemini/:userMessage", generateContent);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
