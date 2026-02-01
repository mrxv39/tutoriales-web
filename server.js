const express = require('express');
const session = require('express-session');
const path = require('path');

// Initialize database (creates tables)
require('./server/db');

// Import routes
const authRoutes = require('./server/routes/auth');
const profileRoutes = require('./server/routes/profile');

const app = express();
const PORT = 3000;

// Trust proxy if behind reverse proxy (for secure cookies in production)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// JSON body parser
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

