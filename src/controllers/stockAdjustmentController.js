const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

const createStockAdjustment = async (req, res) => {
  const { inventoryId, type, quantity, reason, notes, reference } = req.body;
  const shopId = req.shop.id;

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the adjustment record
      const adjustment = await tx.stockAdjustment.create({
        data: {
          shopId,
          inventoryId,
          type,
          quantity,
          reason,
          notes,
          reference
        }
      });

      // Update inventory quantity
      const quantityChange = type === 'OUT' ? -quantity : quantity;
      const inventory = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: {
            increment: quantityChange
          }
        }
      });

      return { adjustment, inventory };
    });

    return sendResponse(res, {
      data: result,
      message: 'Stock adjustment created successfully'
    });
  } catch (error) {
    console.error('Create stock adjustment error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to create stock adjustment',
      error: error.message
    });
  }
};

const getStockAdjustments = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { inventoryId, startDate, endDate } = req.query;

    const where = { shopId };
    if (inventoryId) where.inventoryId = inventoryId;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const adjustments = await prisma.stockAdjustment.findMany({
      where,
      include: {
        inventory: {
          select: {
            name: true,
            partNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendResponse(res, {
      data: adjustments,
      message: 'Stock adjustments retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch stock adjustments error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch stock adjustments',
      error: error.message
    });
  }
};

module.exports = {
  createStockAdjustment,
  getStockAdjustments
}; 