// Create this file: src/pages/api/generate-ideas.js
// (You'll need to create the pages/api directories in your src folder)

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyDPaSd2wBdcG8X89qO0K1O4hO9yLH7VzvM');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { objectName } = req.body;

  if (!objectName) {
    return res.status(400).json({ error: "No object name provided." });
  }

  // Structured prompt to get predictable JSON from AI
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
        "title": "Herb Garden Planter",
        "description": "Transform your plastic bottle into a hanging herb garden.",
        "steps": ["Cut the bottle in half", "Poke drainage holes in the bottom", "Add soil and plant herbs", "Hang in a sunny spot"],
        "links": []
      }
    ]
    Do not include any other text, warnings, or explanations in your response, just the JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const ideas = JSON.parse(cleanedText);
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.json(ideas);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ 
      error: "Failed to generate ideas from AI.",
      details: error.message 
    });
  }
}