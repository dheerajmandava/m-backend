const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new shop
const createShop = async (req, res) => {
  try {
    // Validate required fields
    const { name, email, phone, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    const clerkUserId = req.auth.userId;

    // Check if shop already exists for this user
    const existingShop = await prisma.shop.findUnique({
      where: { clerkUserId }
    });

    if (existingShop) {
      return res.status(400).json({ 
        error: 'Shop exists',
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

    res.status(201).json({
      message: 'Shop created successfully',
      data: shop
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to create shop'
    });
  }
};

// Get shop profile
const getShopProfile = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    const shop = await prisma.shop.findUnique({
      where: { clerkUserId }
    });

    if (!shop) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Shop profile not found'
      });
    }

    res.json({
      message: 'Shop profile retrieved',
      data: shop
    });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch shop profile'
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
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { clerkUserId }
    });

    if (!existingShop) {
      return res.status(404).json({ 
        error: 'Not found',
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

    res.json({
      message: 'Shop profile updated',
      data: shop
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update shop profile'
    });
  }
};

module.exports = {
  createShop,
  getShopProfile,
  updateShopProfile
}; 