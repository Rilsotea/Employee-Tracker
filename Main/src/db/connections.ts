import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,            
  host: process.env.DB_HOST,            
  database: 'employee_tracker_db',       
  password: process.env.DB_PASSWORD,     
  port: process.env.DB_PORT,             
});

const connectToDb = async () => {
  try {
    await pool.connect();
    console.log('Connected to the database.');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
};

export { pool, connectToDb };