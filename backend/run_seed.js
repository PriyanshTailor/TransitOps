import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runSeed() {
  try {
    console.log('Running seed_rich_data.sql...');
    const sql = fs.readFileSync(path.join(process.cwd(), '../seed_rich_data.sql'), 'utf8');
    await pool.query(sql);
    console.log('Seed executed successfully!');
  } catch (err) {
    console.error('Error executing seed:', err);
  } finally {
    pool.end();
  }
}

runSeed();
