const { clerkClient, requireAuth } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const requireAuthWithShop = async (req, res, next) => {
  try {
    // First use Clerk's built-in middleware
    await new Promise((resolve, reject) => {
      requireAuth()(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // After authentication, get the shop
    const userId = req.auth.userId;
    
    const shop = await prisma.shop.findUnique({
      where: { clerkUserId: userId }
    });

    req.shop = shop;
    req.hasShop = !!shop;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { requireAuthWithShop }; 