require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Tokenizer } = require('tiktoken');  // You can use this library to count tokens
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define token limits for input and output (adjustable based on your needs)
const MAX_INPUT_TOKENS = 100;  // Max tokens for user input
const MAX_OUTPUT_TOKENS = 500; // Max tokens for model response

// Use a tokenizer to handle the tokenization (install tiktoken or similar package)
const tokenizer = new Tokenizer("gpt2"); // Using GPT-2 model for token counting (can use others depending on the model)

const generateContent = async (req, res) => {
  const { message, userId } = req.body;

  // Ensure the message exists
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Trim input message to stay within token limit (token count based on tokenizer)
  let inputTokens = tokenizer.encode(message).length;
  if (inputTokens > MAX_INPUT_TOKENS) {
    message = tokenizer.decode(tokenizer.encode(message).slice(0, MAX_INPUT_TOKENS)); // Trim tokens if exceeding limit
    inputTokens = MAX_INPUT_TOKENS;
  }

  // Ensure session context exists
  req.session.conversationContext ||= ""; 

  // Trim session context if it exceeds the allowed token limit
  let sessionTokens = tokenizer.encode(req.session.conversationContext).length;
  while (sessionTokens > 5000) { // Example limit for context size
    // Trim the oldest part of the conversation context
    req.session.conversationContext = req.session.conversationContext.split('\n').slice(2).join('\n');
    sessionTokens = tokenizer.encode(req.session.conversationContext).length;
  }

  // Combine message with conversation context for the model prompt
  const trimmedMessage = message.slice(0, MAX_INPUT_TOKENS);
  req.session.conversationContext += `User: ${trimmedMessage}\n`;
  const prompt = req.session.conversationContext + "Assistant: ";

  try {
    // Send the prompt to the model and get the response
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    // Ensure the response doesn't exceed the output token limit
    let outputTokens = tokenizer.encode(text).length;
    if (outputTokens > MAX_OUTPUT_TOKENS) {
      text = tokenizer.decode(tokenizer.encode(text).slice(0, MAX_OUTPUT_TOKENS)); // Trim if necessary
      outputTokens = MAX_OUTPUT_TOKENS;
    }

    // Store the assistant's response in session context for next turn
    req.session.conversationContext += `Assistant: ${text}\n`;

    // Return the response to the user
    res.json({ response: text });

  } catch (err) {
    console.error("Error generating content:", err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
};

module.exports = generateContent;
