const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// Dynamically determine redirect URL based on whether we are in production or local development
const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://task-manager-project-livid.vercel.app' 
  : 'http://localhost:5173';

// 1. SIGN UP ROUTE (Complete Cloud Restriction Bypass)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    if (!supabaseAdmin) {
      throw new Error('Missing Supabase Service Role Key to bypass cloud restrictions.');
    }

    // This forces Supabase to create the user via backend root admin power,
    // completely ignoring the "Allow Self Signup" dashboard restrictions.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Instantly sets status to confirmed
    });

    if (error) {
      const payload = {
        error: error.message || 'Registration failed',
        status: error.status || 400,
        code: error.code || null,
      };

      if (error.message.includes('already registered') || error.status === 422 || error.code === 'email_exists') {
        return res.status(400).json({
          error: 'This email address is already registered.',
          status: 422,
          code: error.code || 'email_exists',
        });
      }

      console.error('Signup error payload:', payload);
      return res.status(payload.status).json(payload);
    }

    res.status(201).json({
      message: 'User registered and auto-confirmed via admin bypass!',
      data: data.user,
    });
  } catch (err) {
    console.error('Signup error raw:', err);

    const status = err?.status || 400;
    res.status(status).json({
      error: err?.message || 'Registration bypass sequence failed.',
      status,
      code: err?.code || 'signup_failed',
    });
  }
});

// 2. CLEAN LOGIN ROUTE (Standard Supabase Auth)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Custom clean messaging for exact credentials check
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Incorrect email or password. Please try again.' });
      }
      return res.status(401).json({ error: error.message });
    }

    if (!data?.session || !data?.user) {
      return res.status(401).json({ error: 'Invalid login credentials state.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      token: data.session.access_token,
      user: data.user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// 3. LOGOUT ROUTE
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.status(200).json({ message: 'Logged out successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. GOOGLE OAUTH REDIRECT ROUTE
router.get('/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${FRONTEND_URL}/dashboard`, // ✅ Now dynamically uses live Vercel or localhost
      },
    });

  if (error) throw error;
    res.redirect(data.url);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to initialize Google OAuth sequence.' });
  }
});

module.exports = router;