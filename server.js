const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { clerkMiddleware } = require('@clerk/express');
const corsOptions = require('./src/config/corsConfig');
const { shopRoutes, jobCardRoutes } = require('./src/routes');

dotenv.config();

// Validate environment variables
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

app.use('/api/shops', shopRoutes);
app.use('/api/job-cards', jobCardRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 