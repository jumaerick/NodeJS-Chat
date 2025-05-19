require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateContent = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  req.session.conversationContext ||= ""; // Modern shorthand

  try {
    req.session.conversationContext += `User: ${message}\n`;
    const prompt = req.session.conversationContext + "Assistant: ";

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    req.session.conversationContext += `Assistant: ${text}\n`;
    res.json({ response: text });

  } catch (err) {
    console.error("Error generating content:", err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
};

module.exports = generateContent;