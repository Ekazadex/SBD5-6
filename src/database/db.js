const { Pool } = require('pg');
require('dotenv').config();

// Improved PostgreSQL connection pool with optimal settings
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  maxUses: 7500, // Close & replace a connection after it's been used this many times
});

// Monitor the pool events for better debugging
pool.on('connect', client => {
  console.log('New client connected to database pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

const connect = async () => {
  try {
    await pool.connect();
    console.log('Database connected successfully');
    
    // Test connection health periodically
    setInterval(async () => {
      try {
        await pool.query('SELECT 1');
      } catch (err) {
        console.error('Database health check failed:', err);
      }
    }, 60000); // Check every minute
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit if initial connection fails
  }
};

connect();

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log queries that take longer than 200ms
    if (duration > 200) {
      console.warn('Slow query:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    console.error('Failed query:', text);
    throw error; // Rethrow to allow handling in service layer
  }
};

module.exports = {
  query,
  pool // Export pool for direct access if needed
};