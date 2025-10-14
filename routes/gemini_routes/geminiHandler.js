import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MAX_INPUT_LENGTH = 200;

export const generateContent = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const trimmedMessage = message.slice(0, MAX_INPUT_LENGTH);

  // Maintain conversation context in session
  req.session.conversationContext ||= "";

  try {
    req.session.conversationContext += `User: ${trimmedMessage}\n`;
    const prompt = req.session.conversationContext + "Assistant:";

    // Use the new API
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;
    req.session.conversationContext += `Assistant: ${text}\n`;

    res.json({ response: text });
  } catch (err) {
    console.error("Error generating content:", err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
};
