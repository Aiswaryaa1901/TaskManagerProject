const { supabase } = require('../config/supabase');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // 👇 ADD THIS LOG TO SEE WHAT IS ACTUALLY WRONG
    if (error) {
      console.error("[MIDDLEWARE SUPABASE ERROR]:", error.message);
      return res.status(403).json({ error: 'Invalid or expired token.', details: error.message });
    }

    if (!user) {
      console.error("[MIDDLEWARE ERROR]: No user found for this token.");
      return res.status(403).json({ error: 'Invalid or expired token.', details: "User object is null" });
    }

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