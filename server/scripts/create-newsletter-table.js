import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function createNewsletterTable() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Connected to database');

    // Create newsletter_subscribers table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT 1,
        subscription_source VARCHAR(50) DEFAULT 'website',
        INDEX idx_email (email),
        INDEX idx_is_active (is_active),
        INDEX idx_subscribed_at (subscribed_at)
      );
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Newsletter subscribers table created successfully');

    // Check if table was created
    const [rows] = await connection.execute('SHOW TABLES LIKE "newsletter_subscribers"');
    if (rows.length > 0) {
      console.log('✅ Table verification: newsletter_subscribers exists');
    }

  } catch (error) {
    console.error('❌ Error creating newsletter table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
createNewsletterTable()
  .then(() => {
    console.log('🎉 Newsletter table migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });