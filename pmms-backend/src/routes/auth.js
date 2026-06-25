const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

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
      // If the error is that the user already exists, let's pass a clean message
      if (error.message.includes('already registered') || error.status === 422) {
        return res.status(400).json({ error: 'This email address is already registered.' });
      }
      throw error;
    }

    res.status(201).json({ 
      message: 'User registered and auto-confirmed via admin bypass!', 
      data: data.user 
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(400).json({ error: err.message || 'Registration bypass sequence failed.' });
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
        redirectTo: 'http://localhost:5173/dashboard',
      },
    });

    if (error) throw error;
    res.redirect(data.url);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to initialize Google OAuth sequence.' });
  }
});

module.exports = router;