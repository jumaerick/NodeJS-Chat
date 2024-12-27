const dotenv = require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});


// Define an object to store previous context (can be stored in memory for the duration of the session)
let conversationContext = "";

const generateContent = async (req, res) => {
    const userMessage = req.params.userMessage;
    
    try {
        // Append the current user message to the existing conversation context
        conversationContext += `User: ${userMessage}\n`;
        
        // Add the conversation context to the prompt to maintain continuity
        const prompt = conversationContext + "Assistant: ";

        // Call the model with the full prompt (including context)
        const result = await model.generateContent(prompt);
        
        // Retrieve and handle the response
        const response = await result.response;
        const text = await response.text();
        
        // Append the assistant's reply to the conversation context for future generations
        conversationContext += `Assistant: ${text}\n`;

        // Send the generated content as a response
        res.json(text);
    } catch (err) {
        console.log(err);
        res.send("Unexpected Error!!!");
    }
};


module.exports = generateContent;