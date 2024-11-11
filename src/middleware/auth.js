const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const requireAuthWithShop = async (req, res, next) => {
  try {
    // Log the incoming request headers
    console.log('Auth headers:', {
      authorization: req.headers.authorization,
      userId: req.auth?.userId
    });

    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: { code: 'AUTH_REQUIRED' }
      });
    }

    // Find the shop profile for this user
    const shop = await prisma.shop.findUnique({
      where: { clerkUserId: req.auth.userId }
    });

    console.log('Auth middleware - Shop check:', {
      userId: req.auth.userId,
      hasShop: !!shop,
      shop
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop profile required',
        error: { code: 'NO_SHOP_PROFILE' }
      });
    }

    // Attach shop data to request
    req.shop = shop;
    req.hasShop = true;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: { code: 'AUTH_ERROR', details: error.message }
    });
  }
};

module.exports = { requireAuthWithShop }; 