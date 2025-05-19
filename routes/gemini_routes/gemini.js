const express = require('express');
const router = express.Router();
const generateContent = require('./geminiHandler');

router.post('/chat/gemini', generateContent);

module.exports = router;
