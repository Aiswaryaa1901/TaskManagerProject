const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// 1. Authenticate using your private key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Select the fast, reliable gemini-2.0-flash model
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

// 3. Export it so our backend can use it for smart insights later
module.exports = geminiModel;