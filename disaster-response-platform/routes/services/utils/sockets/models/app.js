const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { generalLimiter } = require('./utils/rateLimiter');
const { logAction } = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Apply rate limiter globally
app.use(generalLimiter);

// Import routes
const disasterRoutes = require('./routes/disasterRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const updateRoutes = require('./routes/updateRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const socialMediaRoutes = require('./routes/socialMediaRoutes');

// Register routes
app.use('/api/disasters', disasterRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/social-media', socialMediaRoutes);

// Root health check
app.get('/', (req, res) => {
  res.send({ message: 'Disaster Response Platform API is running 🚑' });
  logAction('Root endpoint pinged');
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
