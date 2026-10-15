require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Only the local React dev server may call this API from a browser.
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/employees', employeeRoutes);
app.use('/api', notFoundHandler);
app.use(errorHandler);

async function start() {
  const port = Number(process.env.PORT) || 5000;

  // Check the database early so a bad .env is obvious. The server still starts,
  // and API calls will return a friendly "database unavailable" message.
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connection OK.');
  } catch (err) {
    console.error(`Could not connect to MySQL (${err.code || err.message}). Check backend/.env and that MySQL is running.`);
  }

  app.listen(port, () => console.log(`API running at http://localhost:${port}`));
}

// Only start listening when run directly (node src/app.js), not when imported.
if (require.main === module) {
  start();
}

module.exports = app;
