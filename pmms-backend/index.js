const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import our custom route controllers (Added the correct ./src/ folder path!)
const authRoutes = require('./src/routes/auth');
const taskRoutes = require('./src/routes/tasks');
const projectRoutes = require('./src/routes/projects'); // Fixed path!

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware Configuration (Keep this ABOVE your route definitions!)
// 🚨 FIXED: Explicitly configured CORS to guarantee 'Authorization' headers are permitted
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow standard Vite/React dev ports
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json()); // Allows our backend to read JSON bodies
app.use(express.urlencoded({ extended: true })); // Accept form-encoded bodies if the client sends them

// Optional: Global Request Logger to see headers arriving in real-time in your terminal
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} - Auth Header:`, req.headers.authorization ? "Present" : "MISSING ❌");
  next();
});

// Mount our functional route endpoints
app.use('/api/auth', authRoutes);     // Handles signup, login, logout
app.use('/api/tasks', taskRoutes);   // Handles tasks and AI analytics
app.use('/api/projects', projectRoutes); // Handles real project CRUD operations!

// Root verification route
app.get('/', (req, res) => {
  res.send('Predictive Memory Management System (PMMS) Backend is running smoothly!');
});

// Fire up the engine
app.listen(PORT, '0.0.0.0', () => {
  console.log(`System Engine live and listening on port ${PORT}`);
});