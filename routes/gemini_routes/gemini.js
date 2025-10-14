import express from "express";
import { generateContent } from "./geminiHandler.js"; // named import

const router = express.Router();

// Define the route
router.post("/chat/gemini", generateContent);

export default router;
