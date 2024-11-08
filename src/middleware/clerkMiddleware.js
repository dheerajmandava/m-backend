const { clerkClient, clerkMiddleware, requireAuth } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create custom middleware that combines Clerk auth and shop verification
const requireAuthWithShop = async (req, res, next) => {
  try {
    // First use Clerk's built-in middleware
    await new Promise((resolve) => {
      requireAuth()(req, res, () => resolve());
    });

    // After authentication, get the shop
    const userId = req.auth.userId;
    
    const shop = await prisma.shop.findUnique({
      where: { clerkUserId: userId }
    });

    // Instead of returning 404, attach shop status to request
    req.shop = shop;
    req.hasShop = !!shop;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { requireAuthWithShop }; 