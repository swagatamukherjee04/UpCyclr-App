// // api/generate-ideas.js
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// module.exports = async (req, res) => {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const { objectName } = req.body;
//   if (!objectName) {
//     return res.status(400).json({ error: 'No object name provided.' });
//   }

//   const genAI = new GoogleGenerativeAI(process.env.API_KEY);
//   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//   const prompt = `
//     You are Upcyclr, a creative assistant for upcycling.
//     Generate 3 upcycling ideas for "${objectName}".
//     Respond ONLY with a JSON array where each object has:
//     - "title"
//     - "description"
//     - "steps" (3-5 strings)
//     - "links" (empty array)
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
//     const ideas = JSON.parse(cleanedText);
//     res.status(200).json(ideas);
//   } catch (error) {
//     console.error('Error calling Gemini API:', error);
//     res.status(500).json({ error: 'Failed to generate ideas from AI.' });
//   }
// };
// api/generate-ideas.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log(`Received ${req.method} request, expected POST`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { objectName } = req.body;
  if (!objectName) {
    console.log('No object name provided in request body');
    return res.status(400).json({ error: 'No object name provided.' });
  }

  // Check if API key is available
  if (!process.env.API_KEY && !process.env.GOOGLE_API_KEY) {
    console.log('No API key found in environment variables');
    return res.status(500).json({ error: 'API key not configured.' });
  }

  const apiKey = process.env.API_KEY || process.env.GOOGLE_API_KEY;
  
  try {
    console.log(`Generating ideas for: ${objectName}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are Upcyclr, a creative assistant for upcycling.
      Generate 3 creative and practical upcycling ideas for "${objectName}".
      Respond ONLY with a valid JSON array where each object has exactly these fields:
      - "title": A catchy name for the project
      - "description": A brief description of what you're making
      - "steps": An array of 3-5 simple step strings
      - "links": An empty array []
      
      Make sure the response is valid JSON that can be parsed directly.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Raw AI response:', text);
    
    // Clean the response more thoroughly
    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .trim();
    
    console.log('Cleaned response:', cleanedText);
    
    try {
      const ideas = JSON.parse(cleanedText);
      
      // Validate the structure
      if (!Array.isArray(ideas)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each idea has required fields
      const validatedIdeas = ideas.map((idea, index) => {
        if (!idea.title || !idea.description || !Array.isArray(idea.steps)) {
          console.log(`Invalid idea structure at index ${index}:`, idea);
          return {
            title: `Upcycle Project ${index + 1}`,
            description: `Creative project using ${objectName}`,
            steps: [
              "Gather your materials",
              "Plan your design", 
              "Execute your project",
              "Enjoy your creation!"
            ],
            links: []
          };
        }
        return {
          title: idea.title,
          description: idea.description,
          steps: Array.isArray(idea.steps) ? idea.steps : ["Steps not available"],
          links: idea.links || []
        };
      });
      
      console.log(`Successfully generated ${validatedIdeas.length} ideas`);
      res.status(200).json(validatedIdeas);
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Failed to parse:', cleanedText);
      
      // Return fallback ideas if JSON parsing fails
      const fallbackIdeas = [
        {
          title: `NOpe ${objectName}`,
          description: `Transform your ${objectName} into something useful and beautiful.`,
          steps: [
            "Clean and prepare your item",
            "Plan your design and gather materials", 
            "Execute your transformation",
            "Enjoy your upcycled creation!"
          ],
          links: []
        },
        {
          title: `Functional Project with ${objectName}`,
          description: `Give your ${objectName} a new purpose in your home.`,
          steps: [
            "Assess what you need in your space",
            "Design your solution",
            "Modify and customize as needed",
            "Put your new creation to use!"
          ],
          links: []
        }
      ];
      
      res.status(200).json(fallbackIdeas);
    }
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return fallback ideas on API error
    const fallbackIdeas = [
      {
        title: `DIY Project with ${objectName}`,
        description: `Transform your ${objectName} into something amazing!`,
        steps: [
          "Clean and prepare your materials",
          "Research similar projects online",
          "Gather necessary tools",
          "Start your creative project!"
        ],
        links: []
      }
    ];
    
    res.status(200).json(fallbackIdeas);
  }
};