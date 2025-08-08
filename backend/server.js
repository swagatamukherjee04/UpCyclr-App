// backend/server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = 3001; // Use a different port than your React app (3000)

// Middleware to allow cross-origin requests and parse JSON
app.use(cors());
app.use(express.json());

// Get API key from .env file
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// AI model instance (using Gemini 1.5 Flash for speed)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define the backend API endpoint
app.post('/api/generate-ideas', async (req, res) => {
  const { objectName } = req.body;

  if (!objectName) {
    return res.status(400).json({ error: "No object name provided." });
  }

  // This is the CRUCIAL 'structured prompt' to get a predictable JSON from the AI
  const prompt = `
    You are Upcyclr, a creative assistant for upcycling.
    Generate 3 upcycling ideas for the object: "${objectName}".
    The response MUST be in a single JSON array, where each item is an object with the following keys:
    - "title": A short, creative title for the idea (string).
    - "description": A brief, one-sentence description of the idea (string).
    - "steps": An array of 3-5 simple, numbered steps to perform the upcycle (array of strings).
    - "links": An empty array for now (to match the required format).

    Example JSON format:
    [
      {
        "title": "Example Title",
        "description": "Example description.",
        "steps": ["Step 1.", "Step 2.", "Step 3."],
        "links": []
      }
    ]
    Do not include any other text, warnings, or explanations in your response, just the JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim(); // Clean up code blocks if present
    const ideas = JSON.parse(cleanedText); // Parse the AI's response
    res.json(ideas);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate ideas from AI." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Upcyclr Backend listening at http://localhost:${port}`);
});