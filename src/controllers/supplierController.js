const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

const getSuppliers = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const suppliers = await prisma.supplier.findMany({
      where: { shopId },
      orderBy: { name: 'asc' }
    });

    return sendResponse(res, {
      data: suppliers,
      message: 'Suppliers retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch suppliers error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;

    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        shopId
      }
    });

    if (!supplier) {
      return sendError(res, {
        status: 404,
        message: 'Supplier not found'
      });
    }

    return sendResponse(res, {
      data: supplier,
      message: 'Supplier retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch supplier error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
};

const getSupplierOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;

    const orders = await prisma.partOrder.findMany({
      where: {
        supplierId: id,
        shopId
      },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sendResponse(res, {
      data: orders,
      message: 'Supplier orders retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch supplier orders error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch supplier orders',
      error: error.message
    });
  }
};

const getSupplierInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;

    const inventory = await prisma.inventory.findMany({
      where: {
        supplierId: id,
        shopId
      },
      orderBy: {
        partNumber: 'asc'
      }
    });

    return sendResponse(res, {
      data: inventory,
      message: 'Supplier inventory retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch supplier inventory error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch supplier inventory',
      error: error.message
    });
  }
};

const createSupplier = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const {
      name,
      email,
      phone,
      address,
      terms,
      leadTime
    } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        shopId,
        name,
        email,
        phone,
        address,
        terms,
        leadTime: leadTime ? parseInt(leadTime) : null
      }
    });

    return sendResponse(res, {
      data: supplier,
      message: 'Supplier created successfully'
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;
    const updateData = req.body;

    const supplier = await prisma.supplier.update({
      where: {
        id,
        shopId
      },
      data: {
        ...updateData,
        leadTime: updateData.leadTime ? parseInt(updateData.leadTime) : null
      }
    });

    return sendResponse(res, {
      data: supplier,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  getSupplierOrders,
  getSupplierInventory,
  createSupplier,
  updateSupplier
}; 