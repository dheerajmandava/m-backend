const prisma = require('../lib/prisma');
const { sendResponse, sendError } = require('../utils/responseHandler');

const scheduleJob = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { jobId, mechanicId, scheduledDate, scheduledTime, estimatedHours } = req.body;

    // Validate mechanic availability
    const existingSchedules = await prisma.jobCard.findMany({
      where: {
        shopId,
        mechanicId,
        scheduledDate,
        NOT: { id: jobId }
      }
    });

    // Check for scheduling conflicts
    const hasConflict = existingSchedules.some(schedule => {
      return schedule.scheduledTime === scheduledTime;
    });

    if (hasConflict) {
      return sendError(res, {
        status: 400,
        message: 'Mechanic already has a job scheduled for this time slot'
      });
    }

    // Schedule the job
    const updatedJob = await prisma.jobCard.update({
      where: { 
        id: jobId,
        shopId 
      },
      data: {
        mechanicId,
        scheduledDate,
        scheduledTime,
        estimatedHours,
        status: 'IN_PROGRESS'
      },
      include: {
        mechanic: true
      }
    });

    return sendResponse(res, {
      data: updatedJob,
      message: 'Job scheduled successfully'
    });
  } catch (error) {
    console.error('Schedule job error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to schedule job',
      error: error.message
    });
  }
};

const getSchedule = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { date } = req.query;

    const schedules = await prisma.jobCard.findMany({
      where: {
        shopId,
        scheduledDate: date ? new Date(date) : undefined,
        mechanicId: { not: null }
      },
      include: {
        mechanic: true
      },
      orderBy: {
        scheduledTime: 'asc'
      }
    });

    return sendResponse(res, {
      data: schedules,
      message: 'Schedule retrieved successfully'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { id } = req.params;
    const { scheduledDate, scheduledTime, mechanicId, estimatedHours } = req.body;

    // Validate required fields
    if (!scheduledDate || !scheduledTime || !mechanicId || !estimatedHours) {
      return sendError(res, {
        status: 400,
        message: 'Missing required fields'
      });
    }

    // Validate mechanic availability
    const existingSchedules = await prisma.jobCard.findMany({
      where: {
        shopId,
        mechanicId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        NOT: { id }
      }
    });

    if (existingSchedules.length > 0) {
      return sendError(res, {
        status: 400,
        message: 'Mechanic already has a job scheduled for this time slot'
      });
    }

    const updatedJob = await prisma.jobCard.update({
      where: { 
        id,
        shopId 
      },
      data: {
        mechanicId: parseInt(mechanicId),
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        estimatedHours: parseFloat(estimatedHours)
      },
      include: {
        mechanic: true
      }
    });

    return sendResponse(res, {
      data: updatedJob,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    console.error('Schedule update error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

module.exports = {
  scheduleJob,
  getSchedule,
  updateSchedule
}; 