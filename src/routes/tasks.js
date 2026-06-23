const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const geminiModel = require('../config/gemini');
const authMiddleware = require('../middleware/auth');

// Apply the security guard middleware to ALL task routes below
router.use(authMiddleware);

// 1. CREATE A NEW TASK
router.post('/', async (req, res) => {
  const { title, description, memory_weight } = req.body;
  const userId = req.user.id; // Pulled from the verified JWT by our middleware

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, description, memory_weight, user_id: userId }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. GET ALL TASKS FOR THE LOGGED-IN USER
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. GET AI MEMORY ANALYTICS & PREDICTIONS
router.get('/analytics', async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user's tasks to feed to Gemini
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('title, memory_weight')
      .eq('user_id', userId);

    if (error) throw error;

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({ summary: "No tasks found to analyze yet." });
    }

    // Format the tasks into a simple text prompt for the model
    const taskListString = tasks.map(t => `- ${t.title} (Weight: ${t.memory_weight})`).join('\n');
    const prompt = `Analyze the following system tasks and their weights for a Predictive Memory Management System. Provide a brief, 2-line optimization prediction summary:\n${taskListString}`;

    // Call the Gemini model we configured
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({
      total_tasks: tasks.length,
      prediction: responseText
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;