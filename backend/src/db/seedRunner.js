const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runSeed() {
  console.log('[DB Seed]: Connecting to MySQL database server...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'dairy_hub',
    multipleStatements: true
  });

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
