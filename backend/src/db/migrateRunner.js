const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
  console.log('[DB Migrate]: Connecting to MySQL database server...');
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
        multipleStatements: true,
        ...(sslOptions ? { ssl: sslOptions } : {})
      };
    } catch (e) {}
  }

  const connection = await mysql.createConnection(connConfig);

  try {
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('[DB Migrate]: Executing schema.sql...');
    await connection.query(sql);
    console.log('[DB Migrate]: Schema migration completed successfully!');
  } catch (error) {
    console.error('[DB Migrate Error]:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
