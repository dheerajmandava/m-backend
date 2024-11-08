const { clerkClient, requireAuth: clerkRequireAuth } = require('@clerk/express');

const requireAuth = (req, res, next) => {
  try {
    // Use Clerk's built-in middleware
    clerkRequireAuth()(req, res, next);
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { requireAuth }; 