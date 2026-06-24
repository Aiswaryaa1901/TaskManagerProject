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
app.use(cors());
app.use(express.json()); // Allows our backend to read JSON bodies
app.use(express.urlencoded({ extended: true })); // Accept form-encoded bodies if the client sends them

// Mount our functional route endpoints
app.use('/api/auth', authRoutes);     // Handles signup, login, logout
app.use('/api/tasks', taskRoutes);   // Handles tasks and AI analytics
app.use('/api/projects', projectRoutes); // Handles real project CRUD operations!

// Root verification route
app.get('/', (req, res) => {
  res.send('Predictive Memory Management System (PMMS) Backend is running smoothly!');
});

// Fire up the engine
app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});