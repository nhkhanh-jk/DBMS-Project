const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));

  // Import routes
  const authRoutes = require('./routes/auth');
  const movieRoutes = require('./routes/movies');
  const showtimeRoutes = require('./routes/showtimes');
  const bookingRoutes = require('./routes/bookings');
  const seatRoutes = require('./routes/seats');
  const reviewRoutes = require('./routes/reviews');
  const serviceRequestRoutes = require('./routes/serviceRequests');
  const cinemaRoutes = require('./routes/cinemas');
  const userRoutes = require('./routes/users');

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/showtimes', showtimeRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/seats', seatRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/service-requests', serviceRequestRoutes);
  app.use('/api/cinemas', cinemaRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Error handler (should be last)
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
