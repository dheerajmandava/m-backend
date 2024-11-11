const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

const getPartOrders = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const orders = await prisma.partOrder.findMany({
      where: { shopId },
      include: {
        supplier: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendResponse(res, {
      data: orders,
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

const getPartOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;

    const order = await prisma.partOrder.findFirst({
      where: {
        id,
        shopId
      },
      include: {
        supplier: true,
        items: true
      }
    });

    if (!order) {
      return sendError(res, {
        status: 404,
        message: 'Order not found'
      });
    }

    return sendResponse(res, {
      data: order,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch order error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

const createPartOrder = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { supplierId, items, notes } = req.body;

    // Calculate total
    const total = items.reduce((sum, item) => 
      sum + (parseFloat(item.costPrice) * parseInt(item.quantity)), 0
    );

    const order = await prisma.partOrder.create({
      data: {
        shopId,
        supplierId,
        status: 'PENDING',
        notes,
        total,
        items: {
          create: items.map(item => ({
            partNumber: item.partNumber,
            name: item.name,
            quantity: parseInt(item.quantity),
            costPrice: parseFloat(item.costPrice),
            total: parseFloat(item.costPrice) * parseInt(item.quantity),
            status: 'PENDING'
          }))
        }
      },
      include: {
        supplier: true,
        items: true
      }
    });

    return sendResponse(res, {
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const shopId = req.shop.id;

    const order = await prisma.partOrder.update({
      where: {
        id,
        shopId
      },
      data: {
        status,
        notes: notes ? {
          push: `${new Date().toISOString()}: ${notes}`
        } : undefined
      },
      include: {
        supplier: true,
        items: true
      }
    });

    // If order is complete, update inventory
    if (status === 'COMPLETE') {
      for (const item of order.items) {
        await prisma.inventory.upsert({
          where: {
            shopId_partNumber: {
              shopId,
              partNumber: item.partNumber
            }
          },
          update: {
            quantity: {
              increment: item.quantity
            }
          },
          create: {
            shopId,
            partNumber: item.partNumber,
            name: item.name,
            quantity: item.quantity,
            minQuantity: 5, // Default value
            costPrice: item.costPrice,
            sellingPrice: item.costPrice * 1.3, // Default markup
          }
        });
      }
    }

    return sendResponse(res, {
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

module.exports = {
  getPartOrders,
  getPartOrderById,
  createPartOrder,
  updateOrderStatus
}; 