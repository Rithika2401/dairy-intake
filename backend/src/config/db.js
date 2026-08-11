const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

function getPoolConfig() {
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

  const isSslRequired =
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    (process.env.NODE_ENV === 'production' &&
      process.env.DB_HOST &&
      process.env.DB_HOST !== '127.0.0.1' &&
      process.env.DB_HOST !== 'localhost');

  const sslOptions = isSslRequired ? { rejectUnauthorized: false } : undefined;

  if (dbUrl) {
    try {
      const parsedUrl = new URL(dbUrl);
      return {
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port || '3306', 10),
        user: parsedUrl.username,
        password: parsedUrl.password,
        database: parsedUrl.pathname ? parsedUrl.pathname.replace('/', '') : 'dairy_hub',
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        multipleStatements: true,
        ...(sslOptions ? { ssl: sslOptions } : {})
      };
    } catch (e) {
      console.warn('[MySQL Config Warning]: Failed to parse DATABASE_URL, using default options.');
    }
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'dairy_hub',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    multipleStatements: true,
    ...(sslOptions ? { ssl: sslOptions } : {})
  };
}

const pool = mysql.createPool(getPoolConfig());

/**
 * Execute a SQL query using connection pool
 */
async function query(sql, params = []) {
  try {
    const [rows, fields] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error(`[MySQL Database Query Error]: ${error.message} | SQL: ${sql.substring(0, 100)}...`);
    throw error;
  }
}

/**
 * Execute callback within a MySQL transaction boundary
 */
async function transaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error(`[MySQL Transaction Rollback]: ${error.message}`);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Verify DB Connection health
 */
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[MySQL Health Check Warning]: Connection refused - ${error.message}`);
    return false;
  }
}

module.exports = {
  pool,
  query,
  transaction,
  checkConnection
};
