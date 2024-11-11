const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendResponse, sendError } = require('../utils/responseHandler');

const getInventoryReports = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { timeframe } = req.query;
    const days = parseInt(timeframe) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get inventory summary
    const inventory = await prisma.inventory.findMany({
      where: { shopId }
    });

    // Get low stock items
    const lowStockItems = inventory.filter(item => 
      item.quantity <= item.minQuantity
    ).length;

    // Calculate total value
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.quantity * item.costPrice), 0
    );

    // Get stock movements
    const movements = await prisma.stockAdjustment.findMany({
      where: {
        shopId,
        createdAt: {
          gte: startDate
        }
      },
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

    // Calculate top movers
    const itemMovements = movements.reduce((acc, mov) => {
      const key = mov.inventoryId;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          name: mov.inventory.name,
          movements: 0
        };
      }
      acc[key].movements += Math.abs(mov.quantity);
      return acc;
    }, {});

    const topMovers = Object.values(itemMovements)
      .sort((a, b) => b.movements - a.movements)
      .slice(0, 5);

    return sendResponse(res, {
      data: {
        totalItems: inventory.length,
        lowStockItems,
        totalValue,
        topMovers,
        recentTransactions: movements.slice(0, 10)
      },
      message: 'Reports retrieved successfully'
    });
  } catch (error) {
    console.error('Fetch inventory reports error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to fetch inventory reports',
      error: error.message
    });
  }
};

const exportInventoryReport = async (req, res) => {
  try {
    const shopId = req.shop.id;
    const { timeframe } = req.query;
    const days = parseInt(timeframe) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const inventory = await prisma.inventory.findMany({
      where: { shopId },
      include: {
        supplier: {
          select: {
            name: true
          }
        },
        adjustments: {
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }
      }
    });

    // Create CSV content
    const csvRows = [
      ['Part Number', 'Name', 'Quantity', 'Min Quantity', 'Cost Price', 'Selling Price', 'Supplier', 'Total Value', 'Movements']
    ];

    inventory.forEach(item => {
      csvRows.push([
        item.partNumber,
        item.name,
        item.quantity,
        item.minQuantity,
        item.costPrice,
        item.sellingPrice,
        item.supplier?.name || '-',
        (item.quantity * item.costPrice).toFixed(2),
        item.adjustments.length
      ]);
    });

    const csv = csvRows.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
    
    return res.send(csv);
  } catch (error) {
    console.error('Export inventory report error:', error);
    return sendError(res, {
      status: 500,
      message: 'Failed to export inventory report',
      error: error.message
    });
  }
};

module.exports = {
  getInventoryReports,
  exportInventoryReport
}; 