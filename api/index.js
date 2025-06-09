// index.js
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');
const errorMiddleware = require("../middleware/errorMiddleware");
const connectDB = require('../config/database');
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const analyticsRoutes = require("../routes/analyticsRoute");
const pointsRoutes = require("../routes/pointsRoute");
const stepCoinsRoutes = require("../routes/stepsCoinRoute");
connectDB();

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

// Serve public folder
app.use(express.static(path.join(__dirname, "..", 'public',)));

// Default route
// Serve index.html when '/' is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "..", 'public', 'index.html'));
});

// Auth Route
app.use('/api/v1/auth', authRoutes);

// Users Route
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/points', pointsRoutes);
   
app.use('/api/v1/step-coins', stepCoinsRoutes);


app.use(errorMiddleware);

module.exports = app;
