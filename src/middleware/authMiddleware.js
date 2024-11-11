const { clerkClient, requireAuth: clerkRequireAuth } = require('@clerk/express');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('Auth middleware - headers:', {
    auth: authHeader || 'Missing',
    path: req.path
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid authorization header' });
  }

  try {
    // Use Clerk's built-in middleware
    clerkRequireAuth()(req, res, next);
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { requireAuth }; 