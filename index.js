import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'; // Automatically loads environment variables from .env file
import express from 'express'
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const fileToGenerativePart = (file, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(file).toString('base64'),
      mimeType,
    },
  };
};

// Example usage
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY, // Replace with your actual API key in the .env file
});

const upload = multer({ storage: multer.memoryStorage() });

//add route handler
app.post('/chat', async (req, res) => {
    const messages = req.body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Invalid request: messages array is required.' });
    }

    const contents = messages.map(message => ({
        role: message.role,
        parts: [{ text: message.content }]
    }));

    try {
        const aiResponse = await genAI.models.generateContent({
            config: {
                systemInstruction: {
                    parts: [
                        { text: "Anda adalah seorang programmer yang gemar membuat puisi sebagai teknis." }
                    ]
                }
            },
            model: "gemini-2.5-flash-lite",
            contents
        });

        return res.status(200).json({
            response: aiResponse.text
        });

    } catch (error) {
        return res.status(500).json({ error: 'Error generating text', details: error.message });
    }
});

//add route generate from image
app.post('/generate-from-image', upload.single('image'), async (req, res) => {


    const prompt = req.body.prompt || 'Describe the image';
    const file = req.file;

    // Mengubah buffer gambar menjadi format yang bisa diproses Gemini
    const imagePart = fileToGenerativePart(file.buffer, file.mimetype);
    // const image = imageToGenerativePart(req.file.path);
    
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [imagePart, { text: prompt }]
            }]
        });
        return res.json({ response: response.text });
    } catch (error) {
        return res.status(500).json({ error: 'Error generating text', details: error.message });
    } finally
    {
        fs.unlinkSync(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            }
        });
    }
});

//add route generate from document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {

    const prompt = req.body.prompt || 'Describe the document';
    const file = req.file;

    // Mengubah buffer dokumen menjadi format yang bisa diproses Gemini
    const documentPart = fileToGenerativePart(file.buffer, file.mimetype);

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [documentPart, { text: prompt }]
            }]
        });
        return res.json({ response: response.text });
    } catch (error) {
        return res.status(500).json({ error: 'Error generating text', details: error.message });
    } finally {
        fs.unlinkSync(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            }
        });
    }
});

//add route for document audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const prompt = req.body.prompt || 'Describe the audio';
    const file = req.file;

    // Mengubah buffer audio menjadi format yang bisa diproses Gemini
    const audioPart = fileToGenerativePart(file.buffer, file.mimetype);

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [audioPart, { text: prompt }]
            }]
        });
        return res.json({ response: response.text });
    } catch (error) {
        return res.status(500).json({ error: 'Error generating text', details: error.message });
    } finally {
        fs.unlinkSync(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            }
        });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});