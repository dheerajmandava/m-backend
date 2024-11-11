const { prisma } = require('../lib/prisma');
const { sendResponse, sendError } = require('../utils/response');

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

    // Update job totals
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