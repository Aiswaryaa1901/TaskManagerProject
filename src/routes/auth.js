const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// 1. SIGN UP ROUTE (With Admin Auto-Confirm Guard)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    if (!supabaseAdmin) {
      throw new Error('Missing Supabase service role key for user creation.');
    }

    // Uses Admin powers to create the user so they are instantly confirmed
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;

    res.status(201).json({ message: 'User registered and auto-confirmed successfully!', data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. CLEAN LOGIN ROUTE (Standard Supabase Auth)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const signIn = async () => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const confirmEmailForUser = async () => {
    if (!supabaseAdmin) {
      throw new Error('Missing Supabase service role key; cannot auto-confirm email.');
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
    if (error) throw error;

    const user = data?.users?.find((u) => u.email === email);
    if (!user) return null;

    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (updateError) throw updateError;
    return updatedUser?.user ?? user;
  };

  try {
    let { data, error } = await signIn();

    if (error && error.message?.toLowerCase().includes('email not confirmed')) {
      try {
        await confirmEmailForUser();
        const retry = await signIn();
        data = retry.data;
        error = retry.error;
      } catch (confirmError) {
        return res.status(500).json({
          error: confirmError.message || 'Email confirmation failed due to invalid admin permissions.',
        });
      }
    }

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (!data?.session || !data?.user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
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

module.exports = router;