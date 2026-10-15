require('dotenv').config();
const mysql = require('mysql2/promise');

// A pool keeps several connections open and hands them out per query,
// which is faster and safer than opening a new connection for every request.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_management',
  waitForConnections: true,
  connectionLimit: 10,
  // Return DATE columns as 'YYYY-MM-DD' strings instead of JS Date objects,
  // which avoids timezone surprises.
  dateStrings: true,
});

module.exports = pool;
