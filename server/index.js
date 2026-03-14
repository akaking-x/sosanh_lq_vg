/**
 * Express Server - Máy chủ chính cho ứng dụng
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const config = require('./config');

// Routes
const heroRoutes = require('./routes/heroRoutes');
const itemRoutes = require('./routes/itemRoutes');
const runeRoutes = require('./routes/runeRoutes');
const summonerSkillRoutes = require('./routes/summonerSkillRoutes');
const mappingRoutes = require('./routes/mappingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

/**
 * Middleware setup
 */

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

// Logging
app.use(morgan('combined'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
if (config.server.isProduction) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

/**
 * Database connection
 */
let db;
const initializeDB = async () => {
  try {
    db = await connectDB();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

/**
 * API Routes
 */

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API endpoints
app.use('/api/heroes', heroRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/runes', runeRoutes);
app.use('/api/summoner-skills', summonerSkillRoutes);
app.use('/api/mappings', mappingRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Serve client build in production
 */
if (config.server.isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

/**
 * Error handling middleware
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

/**
 * Start server
 */
const PORT = config.server.port;

const startServer = async () => {
  try {
    // Initialize database
    await initializeDB();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║  So Sánh Vương Giả & Liên Quân Mobile   ║
║          Server is running              ║
╚══════════════════════════════════════════╝
      `);
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${config.server.nodeEnv}`);
      console.log(`Database: ${config.mongodb.uri}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
