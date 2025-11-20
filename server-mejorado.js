const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyDR1LXFUcdeQTl8B9cjNLgqkg4BfqSDOmk';
const GEMINI_MODEL = 'gemini-2.5-pro';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gemini chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Forwarding message to Gemini: ${message}`);

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract text from Gemini response
    const geminiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                       'No response from Gemini';

    console.log(`Gemini response: ${geminiText}`);

    res.json({ 
      success: true, 
      text: geminiText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.status, error.response?.data || error.message);
    
    // Return upstream error status if available
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'Unknown error occurred';
    
    res.status(status).json({ 
      error: errorMessage,
      details: error.response?.data || null
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: GET http://localhost:${PORT}/health`);
  console.log(`💬 Gemini chat: POST http://localhost:${PORT}/api/gemini/chat`);
});
