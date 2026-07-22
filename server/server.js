require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const scheduleROIJob = require('./jobs/roiCronJob');

const authRoutes = require('./routes/authRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const referralRoutes = require('./routes/referralRoutes');

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'NexaChain API is running' });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/referrals', referralRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  scheduleROIJob();
  app.listen(PORT, () => {
    console.log(`NexaChain API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();

module.exports = app;
