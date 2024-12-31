const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

const allowedOrigins = ['http://127.0.0.1:8000/'];

let corsOptions = {
  origin :allowedOrigins,
}


app.use(cors(corsOptions));


// Serve static files from the "public" directory
const generateContent = require("./routes/gemini.js");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/gemini/:userMessage", generateContent);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});