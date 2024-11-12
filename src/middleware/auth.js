const { clerkClient, requireAuth: clerkRequireAuth } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Base auth middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('Auth middleware - headers:', {
    auth: authHeader || 'Missing',
    path: req.path
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'No valid authorization header',
      error: { code: 'AUTH_REQUIRED' }
    });
  }

  try {
    await clerkRequireAuth()(req, res, () => {
      // Continue to next middleware only if clerk auth succeeds
      next();
    });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed',
      error: { code: 'AUTH_FAILED' }
    });
  }
};

// Shop auth middleware
const requireAuthWithShop = async (req, res, next) => {
  try {
    // First run the base auth check
    await requireAuth(req, res, async () => {
      if (!req.auth?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: { code: 'AUTH_REQUIRED' }
        });
      }

      // Then check for shop
      const shop = await prisma.shop.findUnique({
        where: { clerkUserId: req.auth.userId }
      });

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop profile required',
          error: { code: 'NO_SHOP_PROFILE' }
        });
      }

      req.shop = shop;
      req.hasShop = true;
      next();
    });
  } catch (error) {
    console.error('Shop auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: { code: 'AUTH_ERROR', details: error.message }
    });
  }
};

module.exports = { requireAuth, requireAuthWithShop }; 