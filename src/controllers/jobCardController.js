const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createJobCard = async (req, res) => {
  try {
    if (!req.hasShop) {
      return res.status(400).json({ 
        error: 'Cannot create job card',
        message: 'Please create a shop profile first',
        code: 'NO_SHOP_PROFILE'
      });
    }

    const shopId = req.shop.id;
    const {
      customerName,
      customerPhone,
      customerEmail,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      registrationNo,
      mileage,
      description,
      estimatedCost,
    } = req.body;

    const jobNumber = `JOB-${Date.now()}`;

    const jobCard = await prisma.jobCard.create({
      data: {
        jobNumber,
        shopId,
        customerName,
        customerPhone,
        customerEmail,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        registrationNo,
        mileage,
        description,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
      },
    });

    res.status(201).json(jobCard);
  } catch (error) {
    console.error('Error creating job card:', error);
    res.status(500).json({ error: 'Failed to create job card' });
  }
};

const getShopJobCards = async (req, res) => {
  try {
    console.log('Getting shop job cards:', {
      hasShop: req.hasShop,
      shopId: req?.shop?.id,
      userId: req?.auth?.userId
    });

    if (!req.hasShop) {
      console.log('No shop found for user');
      return res.json({ 
        jobs: [],
        hasShop: false,
        message: 'No shop profile found. Please create a shop profile first.'
      });
    }

    const shopId = req.shop.id;
    const jobCards = await prisma.jobCard.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Found job cards:', {
      count: jobCards.length,
      shopId
    });

    res.json({
      jobs: jobCards,
      hasShop: true
    });
  } catch (error) {
    console.error('Error fetching job cards:', error);
    res.status(500).json({ error: 'Failed to fetch job cards' });
  }
};

const updateJobCardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const shopId = req.shop.id;

    const jobCard = await prisma.jobCard.update({
      where: { 
        id,
        shopId,
      },
      data: { status },
    });

    res.json(jobCard);
  } catch (error) {
    console.error('Error updating job card:', error);
    res.status(500).json({ error: 'Failed to update job card' });
  }
};

module.exports = {
  createJobCard,
  getShopJobCards,
  updateJobCardStatus,
}; 