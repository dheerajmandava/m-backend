const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const attachShopToRequest = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    
    const shop = await prisma.shop.findUnique({
      where: { clerkUserId },
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    req.shop = shop;
    next();
  } catch (error) {
    console.error('Error in shop middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { attachShopToRequest }; 