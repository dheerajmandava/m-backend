const { prisma } = require('../lib/prisma');
const { sendResponse, sendError } = require('../utils/responseHandler');

const getInventorySettings = async (req, res) => {
  try {
    const shopId = req.shop.id;
    
    let settings = await prisma.inventorySettings.findFirst({
      where: { shopId }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.inventorySettings.create({
        data: {
          shopId,
          orderingCost: 500,
          holdingCostPercentage: 20,
          safetyStockPercentage: 20,
          defaultLeadTime: 7
        }
      });
    }

    return sendResponse(res, {
      data: settings,
      message: 'Settings retrieved successfully'
    });
  } catch (error) {
    console.error('Get inventory settings error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to get inventory settings',
      error: error.message
    });
  }
};

const updateInventorySettings = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const {
      orderingCost,
      holdingCostPercentage,
      safetyStockPercentage,
      defaultLeadTime
    } = req.body;

    const settings = await prisma.inventorySettings.upsert({
      where: {
        shopId
      },
      update: {
        orderingCost: parseFloat(orderingCost),
        holdingCostPercentage: parseFloat(holdingCostPercentage),
        safetyStockPercentage: parseFloat(safetyStockPercentage),
        defaultLeadTime: parseInt(defaultLeadTime)
      },
      create: {
        shopId,
        orderingCost: parseFloat(orderingCost),
        holdingCostPercentage: parseFloat(holdingCostPercentage),
        safetyStockPercentage: parseFloat(safetyStockPercentage),
        defaultLeadTime: parseInt(defaultLeadTime)
      }
    });

    return sendResponse(res, {
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update inventory settings error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to update inventory settings',
      error: error.message
    });
  }
};

module.exports = {
  getInventorySettings,
  updateInventorySettings
}; 