const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runSeed() {
  console.log('[DB Seed]: Connecting to MySQL database server...');
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const isSslRequired =
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    (process.env.NODE_ENV === 'production' &&
      process.env.DB_HOST &&
      process.env.DB_HOST !== '127.0.0.1' &&
      process.env.DB_HOST !== 'localhost');
  const sslOptions = isSslRequired ? { rejectUnauthorized: false } : undefined;

  let connConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'dairy_hub',
    multipleStatements: true,
    ...(sslOptions ? { ssl: sslOptions } : {})
  };

  if (dbUrl) {
    try {
      const parsedUrl = new URL(dbUrl);
      connConfig = {
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port || '3306', 10),
        user: parsedUrl.username,
        password: parsedUrl.password,
        database: parsedUrl.pathname ? parsedUrl.pathname.replace('/', '') : 'dairy_hub',
        multipleStatements: true,
        ...(sslOptions ? { ssl: sslOptions } : {})
      };
    } catch (e) {}
  }

  const connection = await mysql.createConnection(connConfig);

  try {
    const seedPath = path.join(__dirname, '../../../database/seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    console.log('[DB Seed]: Executing seed.sql...');
    await connection.query(sql);
    console.log('[DB Seed]: Database seeded successfully!');
  } catch (error) {
    console.error('[DB Seed Error]:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
