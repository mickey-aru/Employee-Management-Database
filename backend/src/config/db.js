
require('dotenv').config();
const mysql = require('mysql2/promise');

const useSsl = process.env.DB_SSL === 'true';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // TLS for TiDB Cloud Starter public endpoint; set DB_SSL=true in live, leave unset locally
  ssl: useSsl ? { minVersion: 'TLSv1.2' } : undefined,

  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000,
  enableKeepAlive: true,
  dateStrings: true,
});

module.exports = pool;
 