const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

// Utility function to generate estimate number
const generateEstimateNumber = async (shopId) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const lastEstimate = await prisma.estimate.findFirst({
    where: { shopId },
    orderBy: { createdAt: 'desc' }
  });
  
  let sequence = 1;
  if (lastEstimate) {
    const lastNumber = parseInt(lastEstimate.estimateNumber.split('-')[2]);
    sequence = lastNumber + 1;
  }
  
  return `EST-${year}${month}-${sequence.toString().padStart(4, '0')}`;
};

// Create new estimate
const createEstimate = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId } = req.params;
    const { 
      items,
      taxRate,
      discountRate,
      notes,
      termsAndConditions,
      validUntil 
    } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = taxRate ? (subtotal * taxRate / 100) : 0;
    const discountAmount = discountRate ? (subtotal * discountRate / 100) : 0;
    const total = subtotal + taxAmount - discountAmount;

    const estimateNumber = await generateEstimateNumber(shopId);

    const estimate = await prisma.estimate.create({
      data: {
        shopId,
        jobCardId,
        estimateNumber,
        subtotal,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        total,
        notes,
        termsAndConditions,
        validUntil: validUntil ? new Date(validUntil) : null,
        items: {
          create: items.map(item => ({
            type: item.type,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            notes: item.notes
          }))
        }
      },
      include: {
        items: true
      }
    });

    return sendResponse(res, {
      data: estimate,
      message: 'Estimate created successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to create estimate',
      error: error.message
    });
  }
};

// Get estimate by ID
const getEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;

    const estimate = await prisma.estimate.findFirst({
      where: {
        id,
        shopId
      },
      include: {
        items: true,
        jobCard: {
          select: {
            jobNumber: true,
            customerName: true,
            vehicleMake: true,
            vehicleModel: true,
            registrationNo: true
          }
        }
      }
    });

    if (!estimate) {
      return sendError(res, {
        status: 404,
        message: 'Estimate not found'
      });
    }

    return sendResponse(res, {
      data: estimate
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch estimate',
      error: error.message
    });
  }
};

// Update estimate status
const updateEstimateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const shopId = req.shop.id;

    const estimate = await prisma.estimate.findFirst({
      where: {
        id,
        shopId
      }
    });

    if (!estimate) {
      return sendError(res, {
        status: 404,
        message: 'Estimate not found'
      });
    }

    const updateData = {
      status,
      notes: notes || estimate.notes
    };

    // Add timestamps based on status
    if (status === 'SENT') updateData.sentAt = new Date();
    if (status === 'APPROVED') updateData.approvedAt = new Date();
    if (status === 'REJECTED') updateData.rejectedAt = new Date();

    const updatedEstimate = await prisma.estimate.update({
      where: { id },
      data: updateData,
      include: {
        items: true
      }
    });

    return sendResponse(res, {
      data: updatedEstimate,
      message: 'Estimate status updated successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to update estimate status',
      error: error.message
    });
  }
};

// List estimates for a job
const listJobEstimates = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId } = req.params;

    const estimates = await prisma.estimate.findMany({
      where: {
        jobCardId,
        shopId
      },
      include: {
        items: true,
        jobCard: {
          select: {
            jobNumber: true,
            customerName: true,
            customerPhone: true,
            vehicleMake: true,
            vehicleModel: true,
            registrationNo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sendResponse(res, { data: estimates });
  } catch (error) {
    return sendError(res, { error });
  }
};

module.exports = {
  createEstimate,
  getEstimate,
  updateEstimateStatus,
  listJobEstimates
}; 