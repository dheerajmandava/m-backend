const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

// Create a new shop
const createShop = async (req, res) => {
  try {
    // Validate required fields
    const { name, email, phone, address } = req.body;
    if (!name || !email) {
      return sendError(res, {
        status: 400,
        message: 'Name and email are required'
      });
    }

    const clerkUserId = req.auth.userId;

    // Check if shop already exists for this user
    const existingShop = await prisma.shop.findUnique({
      where: { clerkUserId }
    });

    if (existingShop) {
      return sendError(res, {
        status: 400,
        message: 'You already have a registered shop'
      });
    }

    // Create new shop
    const shop = await prisma.shop.create({
      data: {
        clerkUserId,
        name,
        email,
        phone,
        address
      }
    });

    return sendResponse(res, {
      status: 201,
      data: shop,
      message: 'Shop created successfully'
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to create shop',
      error: error.message
    });
  }
};

// Get shop profile
const getShopProfile = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    
    if (!clerkUserId) {
      return sendError(res, {
        status: 401,
        message: 'Authentication required',
        error: {
          code: 'AUTH_REQUIRED'
        }
      });
    }

    const shop = await prisma.shop.findUnique({
      where: { clerkUserId }
    });

    if (!shop) {
      return sendError(res, {
        status: 404,
        message: 'Shop profile not found',
        error: {
          code: 'NO_SHOP_PROFILE'
        }
      });
    }

    return sendResponse(res, {
      data: shop,
      message: 'Shop profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching shop:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch shop profile',
      error: error.message
    });
  }
};

// Update shop profile
const updateShopProfile = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { name, email, phone, address } = req.body;

    // Validate required fields
    if (!name || !email) {
      return sendError(res, {
        status: 400,
        message: 'Name and email are required'
      });
    }

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { clerkUserId }
    });

    if (!existingShop) {
      return sendError(res, {
        status: 404,
        message: 'Shop profile not found'
      });
    }

    // Update shop
    const shop = await prisma.shop.update({
      where: { clerkUserId },
      data: {
        name,
        email,
        phone,
        address
      }
    });

    return sendResponse(res, {
      data: shop,
      message: 'Shop profile updated'
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to update shop profile',
      error: error.message
    });
  }
};

const updateShop = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
      return sendError(res, {
        status: 400,
        message: 'Name and email are required'
      });
    }

    const shop = await prisma.shop.update({
      where: { clerkUserId },
      data: {
        name,
        email,
        phone,
        address
      }
    });

    return sendResponse(res, {
      data: shop,
      message: 'Shop updated successfully'
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to update shop',
      error: error.message
    });
  }
};

module.exports = {
  createShop,
  getShopProfile,
  updateShopProfile,
  updateShop
}; 