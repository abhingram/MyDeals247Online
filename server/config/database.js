import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables BEFORE reading any process.env values
// Explicitly load .env.production when in production
if (process.env.NODE_ENV === 'production') {
  const envPath = path.join(__dirname, '..', '.env.production');
  dotenv.config({ path: envPath });
} else {
  // In development, load default .env
  dotenv.config();
}

// Safe validation block - log which DB env vars are missing (without printing secrets)
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');

if (missingVars.length > 0) {
  console.error('❌ Missing required database environment variables:', missingVars.join(', '));
  console.error('Please ensure .env.production file exists with valid DB credentials for production');
  throw new Error(`DB credentials missing in environment variables: ${missingVars.join(', ')}`);
}

// Log successful loading (without exposing secrets)
console.log('✅ Database environment variables loaded successfully');
console.log(`📍 DB_HOST: ${process.env.DB_HOST}`);
console.log(`👤 DB_USER: ${process.env.DB_USER ? '[SET]' : '[NOT SET]'}`);
console.log(`🔒 DB_PASSWORD: ${process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'}`);
console.log(`🗄️  DB_NAME: ${process.env.DB_NAME}`);

// Create connection pool with better error handling
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: String(process.env.DB_USER),
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    console.log('Attempting to reconnect to database...');
    // The pool will automatically handle reconnection
  }
});

export default pool;

// Test connection on startup and fail fast if DB is unavailable
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
})();
