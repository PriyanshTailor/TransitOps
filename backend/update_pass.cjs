const bcrypt = require('bcrypt');

async function gen() {
  const hash = await bcrypt.hash('password123', 10);
  console.log('HASH:', hash);
  
  const pg = require('pg');
  require('dotenv').config();
  const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  
  await pool.query('UPDATE users SET password_hash = $1 WHERE email LIKE \'%@demo.com\'', [hash]);
  console.log('Updated passwords in DB');
  pool.end();
}
gen();
