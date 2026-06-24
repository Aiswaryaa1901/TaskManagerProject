const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Protect all project routes with your JWT security guard
router.use(authMiddleware);

// 1. CREATE A NEW PROJECT
router.post('/', async (req, res) => {
  const { name, description, status = 'Not Started', end_date } = req.body;
  const userId = req.user.id; // Pulled securely from JWT token

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, description, status, end_date, user_id: userId }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. GET ALL PROJECTS OWNED BY THE LOGGED-IN USER (With Search & Status Filtering!)
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const { name, status } = req.query; // For search strings or filter dropdowns

  try {
    let query = supabase.from('projects').select('*').eq('user_id', userId);

    // Requirement #5: Search by name if provided
    if (name) {
      query = query.ilike('name', `%${name}%`); // Case-insensitive partial search
    }

    // Requirement #5: Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. GET A SPECIFIC PROJECT BY ID
router.get('/:id', async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Project not found or unauthorized access." });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. UPDATE / EDIT A PROJECT
router.put('/:id', async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;
  const { name, description, status, end_date } = req.body;

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ name, description, status, end_date })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized to edit." });
    }

    res.status(200).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. DELETE A PROJECT
router.delete('/:id', async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized to delete." });
    }

    res.status(200).json({ message: "Project deleted successfully", project: data[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. GET REAL DASHBOARD STATISTICS (No AI required - 100% Real SQL Counts)
router.get('/analytics/dashboard', async (req, res) => {
  const userId = req.user.id; // Protected by your authMiddleware

  try {
    // 1. Count total projects owned by this user
    const { count: totalProjects, error: projErr } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 2. Count total tasks owned by this user
    const { count: totalTasks, error: taskErr } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 3. Count completed tasks
    const { count: completedTasks, error: compErr } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Completed');

    // 4. Count pending tasks
    const { count: pendingTasks, error: pendErr } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Pending');

    // If any database query failed, throw the error
    if (projErr || taskErr || compErr || pendErr) {
      throw new Error("Failed to calculate real dashboard statistics.");
    }

    // Return the live mathematical counters to your React frontend
    res.status(200).json({
      total_projects: totalProjects || 0,
      total_tasks: totalTasks || 0,
      completed_tasks: completedTasks || 0,
      pending_tasks: pendingTasks || 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. GET ALL TASKS FOR A SPECIFIC PROJECT
// Path: GET /api/projects/:projectId/tasks
router.get('/:projectId/tasks', async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id; // Ensures users can only access tasks they own

  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    // Returns a clean array of tasks tied to this specific project
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;