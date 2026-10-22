
require('dotenv').config();
const mysql = require('mysql2/promise');

// Verify that Render has all required environment variables.
const requiredEnv = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
];

const missingEnv = requiredEnv.filter(
  (key) => process.env[key] === undefined
);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing database environment variables: ${missingEnv.join(', ')}`
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // TLS for TiDB Cloud Starter public endpoint
  ssl: {
    minVersion: 'TLSv1.2',
  },

  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000,
  enableKeepAlive: true,
  dateStrings: true,
});

// Verify the connection and log useful diagnostic details.
async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT 1 AS connected, VERSION() AS version'
    );

    console.log('Database connection successful:', rows[0]);
  } catch (err) {
    console.error('Database connection failed:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
}

testConnection();

module.exports = pool;
 