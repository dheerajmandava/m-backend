const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

const getInventory = async (req, res) => {
  try {
    const shopId = req.shop.id;
    
    const inventory = await prisma.inventory.findMany({
      where: { shopId }
    });

    // Return empty array if no inventory found
    return sendResponse(res, {
      data: inventory || [],
      message: 'Inventory retrieved successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const inventory = await prisma.inventory.findMany({
      where: { 
        shopId,
      },
      orderBy: { 
        quantity: 'asc' 
      }
    });

    // Filter items where quantity is less than or equal to minQuantity
    const lowStockItems = inventory.filter(item => 
      item.quantity <= item.minQuantity
    );

    return sendResponse(res, {
      data: lowStockItems,
      message: 'Low stock items retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch low stock error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch low stock items',
      error: error.message
    });
  }
};

const addInventoryItem = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const {
      partNumber,
      name,
      description,
      quantity,
      minQuantity,
      costPrice,
      sellingPrice,
      location,
      category
    } = req.body;

    const item = await prisma.inventory.create({
      data: {
        shopId,
        partNumber,
        name,
        description,
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity),
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        location,
        category
      }
    });

    return sendResponse(res, {
      data: item,
      message: 'Inventory item added successfully'
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to add inventory item',
      error: error.message
    });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { id } = req.params;
    const updateData = req.body;

    const item = await prisma.inventory.update({
      where: {
        id,
        shopId
      },
      data: {
        ...updateData,
        quantity: updateData.quantity ? parseInt(updateData.quantity) : undefined,
        minQuantity: updateData.minQuantity ? parseInt(updateData.minQuantity) : undefined,
        costPrice: updateData.costPrice ? parseFloat(updateData.costPrice) : undefined,
        sellingPrice: updateData.sellingPrice ? parseFloat(updateData.sellingPrice) : undefined,
      }
    });

    return sendResponse(res, {
      data: item,
      message: 'Inventory item updated successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { id } = req.params;

    await prisma.inventory.delete({
      where: {
        id,
        shopId
      }
    });

    return sendResponse(res, {
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to delete inventory item',
      error: error.message
    });
  }
};

module.exports = {
  getInventory,
  getLowStockItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}; 