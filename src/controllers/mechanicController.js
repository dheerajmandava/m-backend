const prisma = require('../lib/prisma');
const { sendResponse, sendError } = require('../utils/responseHandler');

const createMechanic = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { name, specialties, phone, email } = req.body;

    if (!name || !specialties || !Array.isArray(specialties) || specialties.length === 0) {
      return sendError(res, {
        status: 400,
        message: 'Name and at least one specialty are required',
        error: 'VALIDATION_ERROR'
      });
    }

    const mechanic = await prisma.mechanic.create({
      data: {
        shopId,
        name,
        specialties,
        phone: phone || null,
        email: email || null,
        isActive: true
      }
    });

    return sendResponse(res, {
      status: 201,
      data: mechanic,
      message: 'Mechanic created successfully'
    });
  } catch (error) {
    console.error('Create mechanic error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to create mechanic',
      error: error.message
    });
  }
};

const getShopMechanics = async (req, res) => {
  try {
    const shopId = req.shop.id;
    
    const mechanics = await prisma.mechanic.findMany({
      where: { shopId },
      include: {
        jobs: {
          where: {
            OR: [
              { status: 'PENDING' },
              { status: 'IN_PROGRESS' }
            ],
            NOT: {
              scheduledDate: null
            }
          },
          select: {
            id: true,
            customerName: true,
            status: true,
            scheduledDate: true,
            scheduledTime: true,
            jobNumber: true
          }
        }
      }
    });

    return sendResponse(res, {
      data: mechanics,
      message: 'Mechanics retrieved successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch mechanics',
      error: error.message
    });
  }
};

const updateMechanic = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { id } = req.params;
    const { name, specialties, isActive } = req.body;

    const mechanic = await prisma.mechanic.update({
      where: { 
        id,
        shopId // Ensure mechanic belongs to shop
      },
      data: {
        name,
        specialties,
        isActive
      }
    });

    return sendResponse(res, {
      data: mechanic,
      message: 'Mechanic updated successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to update mechanic',
      error: error.message
    });
  }
};

const deleteMechanic = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { id } = req.params;

    await prisma.mechanic.delete({
      where: { 
        id,
        shopId // Ensure mechanic belongs to shop
      }
    });

    return sendResponse(res, {
      message: 'Mechanic deleted successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to delete mechanic',
      error: error.message
    });
  }
};

const getMechanic = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { id } = req.params;

    const mechanic = await prisma.mechanic.findUnique({
      where: { 
        id,
        shopId
      },
      include: {
        jobs: {
          where: {
            OR: [
              { status: 'PENDING' },
              { status: 'IN_PROGRESS' }
            ],
            NOT: {
              scheduledDate: null
            }
          },
          select: {
            id: true,
            customerName: true,
            status: true,
            scheduledDate: true,
            scheduledTime: true,
            jobNumber: true
          }
        }
      }
    });

    if (!mechanic) {
      return sendError(res, {
        status: 404,
        message: 'Mechanic not found',
        error: 'NOT_FOUND'
      });
    }

    return sendResponse(res, {
      data: mechanic,
      message: 'Mechanic retrieved successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch mechanic',
      error: error.message
    });
  }
};

module.exports = {
  createMechanic,
  getShopMechanics,
  updateMechanic,
  deleteMechanic,
  getMechanic
}; 