const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { clerkMiddleware } = require('@clerk/express');
const corsOptions = require('./src/config/corsConfig');
const shopRoutes = require('./src/routes/shopRoutes');
const jobCardRoutes = require('./src/routes/jobCardRoutes');
const mechanicRoutes = require('./src/routes/mechanicRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const partOrderRoutes = require('./src/routes/partOrderRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const stockAdjustmentRoutes = require('./src/routes/stockAdjustmentRoutes');
const inventoryReportRoutes = require('./src/routes/inventoryReportRoutes');
const inventorySettingsRoutes = require('./src/routes/inventorySettingsRoutes');


dotenv.config();

if (!process.env.CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is required but not set');
  process.exit(1);
}

const app = express();

// Apply CORS first
app.use(cors(corsOptions));

// Then other middleware
app.use(express.json());
app.use(clerkMiddleware());

// Debug logging
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    console.log('Incoming request:', {
      method: req.method,
      path: req.path,
      headers: {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        'content-type': req.headers['content-type']
      }
    });
  }
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply routes
app.use('/api/shops', shopRoutes);
app.use('/api/job-cards', jobCardRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/part-orders', partOrderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);
app.use('/api/inventory-reports', inventoryReportRoutes);
app.use('/api/inventory', inventorySettingsRoutes);


// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 