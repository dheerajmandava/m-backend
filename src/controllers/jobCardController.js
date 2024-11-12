const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

const createJobCard = async (req, res) => {
  try {
    if (!req.hasShop) {
      return sendError(res, {
        status: 404,
        message: 'Shop profile required',
        error: {
          code: 'NO_SHOP_PROFILE'
        }
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
      estimatedCost
    } = req.body;

    // Generate job number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const jobCount = await prisma.jobCard.count({
      where: { shopId }
    });
    
    const sequentialNumber = (jobCount + 1).toString().padStart(4, '0');
    const jobNumber = `JOB-${year}${month}-${sequentialNumber}`;

    // Convert mileage to string or null
    const formattedMileage = mileage ? mileage.toString() : null;

    const jobCard = await prisma.jobCard.create({
      data: {
        shopId,
        jobNumber,
        customerName,
        customerPhone,
        customerEmail,
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear?.toString() || null,
        registrationNo,
        mileage: formattedMileage,
        description,
        estimatedCost: parseFloat(estimatedCost),
        status: 'PENDING'
      }
    });

    return sendResponse(res, {
      status: 201,
      data: jobCard,
      message: 'Job card created successfully'
    });
  } catch (error) {
    console.error('Error creating job card:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to create job card',
      error: error.message
    });
  }
};

const getShopJobCards = async (req, res) => {
  try {
    const shopId = req.shop.id;
    
    const jobCards = await prisma.jobCard.findMany({
      where: { shopId },
      include: {
        mechanic: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sendResponse(res, {
      data: jobCards,  // Send the array directly
      message: 'Jobs retrieved successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

const updateJobStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const userId = req.auth.userId;

  try {
    const currentJob = await prisma.jobCard.findUnique({
      where: { id },
      select: { status: true }
    });

    const updatedJob = await prisma.jobCard.update({
      where: { id },
      data: {
        status: status,
        notes: notes,
        statusHistory: {
          create: {
            fromStatus: currentJob.status,
            toStatus: status,
            notes: notes,
            changedBy: userId
          }
        }
      },
      include: {
        statusHistory: true,
        mechanic: true
      }
    });

    return sendResponse(res, {
      data: updatedJob,
      message: 'Status updated successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to update job status',
      error: error.message
    });
  }
};

const getJobCard = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;

    const jobCard = await prisma.jobCard.findFirst({
      where: { 
        id,
        shopId 
      },
      include: {
        mechanic: true,
        parts: true,
        costs: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!jobCard) {
      return sendError(res, {
        status: 404,
        message: 'Job not found',
        error: { code: 'JOB_NOT_FOUND' }
      });
    }

    // Calculate totals
    const totalParts = jobCard.parts.reduce((sum, part) => 
      sum + (part.sellingPrice * part.quantity), 0);
    const totalLabor = jobCard.costs
      .filter(cost => cost.type === 'LABOR')
      .reduce((sum, cost) => sum + cost.amount, 0);
    const totalOther = jobCard.costs
      .filter(cost => cost.type === 'OTHER')
      .reduce((sum, cost) => sum + cost.amount, 0);

    return sendResponse(res, {
      data: {
        ...jobCard,
        totalParts,
        totalLabor,
        totalOther,
        finalCost: totalParts + totalLabor + totalOther
      },
      message: 'Job retrieved successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
};

const getUnscheduledJobs = async (req, res) => {
  try {
    const shopId = req.shop.id;

    const unscheduledJobs = await prisma.jobCard.findMany({
      where: {
        shopId,
        scheduledDate: null,
        status: {
          not: 'COMPLETED'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response using the fields we actually have in JobCard
    const formattedJobs = unscheduledJobs.map(job => ({
      id: job.id,
      customerName: job.customerName,
      vehicleMake: job.vehicleMake,
      vehicleModel: job.vehicleModel,
      registrationNo: job.registrationNo,
      description: job.description,
      createdAt: job.createdAt
    }));

    return res.json({
      success: true,
      data: formattedJobs
    });

  } catch (error) {
    console.error('Get unscheduled jobs error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch unscheduled jobs',
      error: { code: 'FETCH_ERROR' }
    });
  }
};

const getScheduledJobs = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { date } = req.query;
    
    const where = {
      shopId,
      scheduledDate: {
        not: null
      }
    };

    // Add date filter if provided
    if (date) {
      where.scheduledDate = {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      };
    }
    
    const jobs = await prisma.jobCard.findMany({
      where,
      include: {
        mechanic: true
      },
      orderBy: {
        scheduledTime: 'asc'
      }
    });

    return sendResponse(res, {
      data: jobs,
      message: 'Scheduled jobs retrieved successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch scheduled jobs',
      error: error.message
    });
  }
};

const addJobNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const shopId = req.shop.id;

    const updatedJob = await prisma.jobCard.update({
      where: { 
        id,
        shopId 
      },
      data: {
        notes: {
          create: {
            content: note,
            createdBy: req.auth.userId
          }
        }
      },
      include: {
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return sendResponse(res, {
      data: updatedJob,
      message: 'Note added successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

const updateJobCard = async (req, res) => {
  try {
    const { id } = req.params;
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
      estimatedCost
    } = req.body;

    const updatedJob = await prisma.jobCard.update({
      where: { 
        id,
        shopId 
      },
      data: {
        customerName,
        customerPhone,
        customerEmail,
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear?.toString() || null,
        registrationNo,
        mileage: mileage?.toString() || null,
        description,
        estimatedCost: parseFloat(estimatedCost)
      },
      include: {
        mechanic: true,
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return sendResponse(res, {
      data: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Update job error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

const deleteJobCard = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shop.id;

    await prisma.jobCard.delete({
      where: { 
        id,
        shopId 
      }
    });

    return sendResponse(res, {
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

const addPartToJob = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId } = req.params;
    const { inventoryId, quantity } = req.body;

    const result = await prisma.$transaction(async (prisma) => {
      // Check inventory first
      const inventoryItem = await prisma.inventory.findUnique({
        where: { id: inventoryId, shopId }
      });

      if (!inventoryItem || inventoryItem.quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      // Decrease inventory quantity
      await prisma.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: {
            decrement: quantity
          }
        }
      });

      // Create stock adjustment record
      await prisma.stockAdjustment.create({
        data: {
          shopId,
          inventoryId,
          type: 'OUT',
          quantity,
          reason: 'JOB_PART',
          reference: jobCardId,
          notes: `Added to Job Card ${jobCardId}`
        }
      });

      // Create the part
      const part = await prisma.part.create({
        data: {
          shopId,
          jobCardId,
          inventoryId,
          name: inventoryItem.name,
          partNumber: inventoryItem.partNumber,
          quantity,
          costPrice: inventoryItem.costPrice,
          sellingPrice: inventoryItem.sellingPrice,
          status: 'PENDING'
        }
      });

      return part;
    });

    return sendResponse(res, {
      data: result,
      message: 'Part added successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: error.message || 'Failed to add part',
      error: error.message
    });
  }
};

const updatePart = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId, partId } = req.params;
    const updateData = req.body;

    const part = await prisma.part.update({
      where: { 
        id: partId,
        shopId,
        jobCardId 
      },
      data: updateData
    });

    await updateJobTotals(jobCardId);

    return sendResponse(res, {
      data: part,
      message: 'Part updated successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to update part',
      error: error.message
    });
  }
};

const deletePart = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId, partId } = req.params;

    // First find the part
    const part = await prisma.part.findFirst({
      where: { 
        id: partId,
        shopId,
        jobCardId 
      }
    });

    if (!part) {
      return sendError(res, {
        status: 404,
        message: 'Part not found',
      });
    }

    // If part exists and was from inventory, return quantity
    if (part.inventoryId) {
      await prisma.$transaction(async (prisma) => {
        // Delete the part
        await prisma.part.delete({
          where: { id: partId }
        });

        // Return quantity to inventory
        await prisma.inventory.update({
          where: { id: part.inventoryId },
          data: {
            quantity: {
              increment: part.quantity
            }
          }
        });

        // Create stock adjustment record
        await prisma.stockAdjustment.create({
          data: {
            shopId,
            inventoryId: part.inventoryId,
            type: 'IN',
            quantity: part.quantity,
            reason: 'REMOVAL',
            reference: jobCardId,
            notes: `Removed from Job Card ${jobCardId}`
          }
        });
      });
    } else {
      // If part wasn't from inventory, just delete it
      await prisma.part.delete({
        where: { id: partId }
      });
    }

    await updateJobTotals(jobCardId);

    return sendResponse(res, {
      message: 'Part deleted successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to delete part',
      error: error.message
    });
  }
};

const addJobCost = async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const { type, description, hours, rate, amount } = req.body;

    const cost = await prisma.jobCost.create({
      data: {
        jobCardId,
        type,
        description,
        hours: hours ? parseFloat(hours) : null,
        rate: rate ? parseFloat(rate) : null,
        amount: parseFloat(amount)
      }
    });

    await updateJobTotals(jobCardId);

    return sendResponse(res, {
      data: cost,
      message: 'Cost added successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to add cost',
      error: error.message
    });
  }
};

const updateJobCost = async (req, res) => {
  try {
    const { jobCardId, costId } = req.params;
    const updateData = req.body;

    const cost = await prisma.jobCost.update({
      where: { 
        id: costId,
        jobCardId 
      },
      data: updateData
    });

    await updateJobTotals(jobCardId);

    return sendResponse(res, {
      data: cost,
      message: 'Cost updated successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to update cost',
      error: error.message
    });
  }
};

const deleteJobCost = async (req, res) => {
  try {
    const { jobCardId, costId } = req.params;

    await prisma.jobCost.delete({
      where: { 
        id: costId,
        jobCardId 
      }
    });

    await updateJobTotals(jobCardId);

    return sendResponse(res, {
      message: 'Cost deleted successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to delete cost',
      error: error.message
    });
  }
};

// Helper function to update job totals
const updateJobTotals = async (jobCardId) => {
  const parts = await prisma.part.findMany({
    where: { 
      jobCardId,
      status: {
        not: 'RETURNED'  // Explicitly exclude RETURNED parts
      }
    }
  });

  const totalParts = parts.reduce((sum, part) => 
    sum + (part.sellingPrice * part.quantity), 0
  );

  await prisma.jobCard.update({
    where: { id: jobCardId },
    data: {
      totalParts,
      finalCost: totalParts // Update this if you have other costs to include
    }
  });
};

const installJobPart = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId, partId } = req.params;
    const userId = req.auth.userId;

    const part = await prisma.part.update({
      where: { 
        id: partId,
        shopId,
        jobCardId,
        status: 'PENDING'
      },
      data: {
        status: 'INSTALLED',
        installedAt: new Date(),
        installedBy: userId
      }
    });

    return sendResponse(res, {
      data: part,
      message: 'Part marked as installed'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to install part',
      error: error.message
    });
  }
};

const returnJobPart = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId, partId } = req.params;
    const { reason } = req.body;

    const result = await prisma.$transaction(async (prisma) => {
      const part = await prisma.part.findUnique({
        where: { id: partId }
      });

      if (!part || (part.status !== 'PENDING' && part.status !== 'INSTALLED')) {
        throw new Error('Part cannot be returned');
      }

      // Update part status
      await prisma.part.update({
        where: { id: partId },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnReason: reason
        }
      });

      // Return quantity to inventory
      if (part.inventoryId) {
        await prisma.inventory.update({
          where: { id: part.inventoryId },
          data: {
            quantity: {
              increment: part.quantity
            }
          }
        });

        await prisma.stockAdjustment.create({
          data: {
            shopId,
            inventoryId: part.inventoryId,
            type: 'IN',
            quantity: part.quantity,
            reason: 'RETURN',
            reference: jobCardId,
            notes: reason
          }
        });
      }

      return part;
    });

    await updateJobTotals(jobCardId);

    return sendResponse(res, {
      data: result,
      message: 'Part returned successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: error.message || 'Failed to return part',
      error: error.message
    });
  }
};

const getJobParts = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId } = req.params;

    const parts = await prisma.part.findMany({
      where: {
        shopId,
        jobCardId,
        status: {
          not: 'RETURNED'
        }
      },
      include: {
        inventory: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return empty data if no parts found
    return sendResponse(res, {
      data: {
        parts: parts || [],
        totalCost: parts.reduce((sum, part) => 
          sum + (part.sellingPrice * part.quantity), 0
        )
      },
      message: 'Parts retrieved successfully'
    });
  } catch (error) {
    // Only return error for actual errors, not empty results
    return sendError(res, {
      status: 500,
      message: 'Failed to get parts',
      error: error.message
    });
  }
};

const removeJobPart = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobCardId, partId } = req.params;

    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Get the part first
      const part = await prisma.part.findFirst({
        where: { 
          id: partId,
          shopId,
          jobCardId
        }
      });

      if (!part) {
        throw new Error('Part not found');
      }

      // If part was from inventory and not installed, return to stock
      if (part.inventoryId && part.status === 'PENDING') {
        await prisma.inventory.update({
          where: { id: part.inventoryId },
          data: {
            quantity: {
              increment: part.quantity
            }
          }
        });

        // Create stock adjustment record
        await prisma.stockAdjustment.create({
          data: {
            shopId,
            inventoryId: part.inventoryId,
            type: 'IN',
            quantity: part.quantity,
            reason: 'REMOVAL',
            reference: jobCardId,
            notes: 'Part removed from job'
          }
        });
      }

      // Delete the part
      await prisma.part.delete({
        where: { id: partId }
      });

      return part;
    });

    return sendResponse(res, {
      data: result,
      message: 'Part removed successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to remove part',
      error: error.message
    });
  }
};

module.exports = {
  createJobCard,
  getJobCard,
  updateJobStatus,
  addJobNote,
  getUnscheduledJobs,
  getScheduledJobs,
  getShopJobCards,
  updateJobCard,
  deleteJobCard,
  addPartToJob,
  updatePart,
  deletePart,
  addJobCost,
  updateJobCost,
  deleteJobCost,
  installJobPart,
  returnJobPart,
  getJobParts,
  removeJobPart
}; 