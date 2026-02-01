const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Determine data directory based on environment
// Use /data on Fly.io (when FLY_APP_NAME is set or /data exists)
// Otherwise use ./data for local development
let dataDir;
if (process.env.FLY_APP_NAME || fs.existsSync('/data')) {
  dataDir = '/data';
} else {
  dataDir = path.join(__dirname, '../../data');
}

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✓ Created data directory:', dataDir);
}

// Open database
const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    data_json TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log('✓ Database initialized at:', dbPath);

module.exports = db;
