import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'; // Automatically loads environment variables from .env file
import express from 'express'
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

// Example usage
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY, // Replace with your actual API key in the .env file
});

//add route handler
app.post('/chat', async (req, res) => {
    
    if (!req.body || typeof req.body.prompt !== 'string' || req.body.prompt.trim() === '') 
    {
        return res.status(400).json({ error: 'Invalid request: prompt is required.' });
    }

    const prompt = req.body.prompt;

    if (prompt.length < 3 || !prompt) {
        return res.status(400).json({ error: 'Prompt must be exist.' });
    }

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return res.json({ response: response.text });
    } catch (error) {
        return res.status(500).json({ error: 'Error generating text', details: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});