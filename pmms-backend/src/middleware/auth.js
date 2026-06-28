const { supabase } = require('../config/supabase');

module.exports = async (req, res, next) => {
  // 1. Always let CORS preflight OPTIONS requests pass through without checking for a token
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;

  // 2. Check if the token is missing or incorrectly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[${req.method}] ${req.url} - Auth Header: MISSING ❌`);
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 3. Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error("[MIDDLEWARE SUPABASE ERROR]:", error.message);
      return res.status(403).json({ error: 'Invalid or expired token.', details: error.message });
    }

    if (!user) {
      console.error("[MIDDLEWARE ERROR]: No user found for this token.");
      return res.status(403).json({ error: 'Invalid or expired token.', details: "User object is null" });
    }

    // 4. Attach user data to request object for downstream routes
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (err) {
    console.error("[MIDDLEWARE CATCH CRASH]:", err.message);
    return res.status(403).json({ error: 'Invalid or expired token.', details: err.message });
  }
};