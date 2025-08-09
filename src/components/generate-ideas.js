// api/generate-ideas.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { objectName } = req.body;
  if (!objectName) {
    return res.status(400).json({ error: 'No object name provided.' });
  }

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are Upcyclr, a creative assistant for upcycling.
    Generate 3 upcycling ideas for "${objectName}".
    Respond ONLY with a JSON array where each object has:
    - "title"
    - "description"
    - "steps" (3-5 strings)
    - "links" (empty array)
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const ideas = JSON.parse(cleanedText);
    res.status(200).json(ideas);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate ideas from AI.' });
  }
};
