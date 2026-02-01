const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    const created_at = new Date().toISOString();

    // Insert user
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)'
    ).run(email, password_hash, created_at);

    // Set session
    req.session.userId = result.lastInsertRowid;
    req.session.email = email;

    res.status(201).json({ 
      message: 'User registered successfully',
      loggedIn: true,
      email 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = db.prepare(
      'SELECT id, email, password_hash FROM users WHERE email = ?'
    ).get(email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({ 
      message: 'Login successful',
      loggedIn: true,
      email: user.email 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed' 
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Logout failed' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ 
      message: 'Logout successful',
      loggedIn: false 
    });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      loggedIn: true, 
      email: req.session.email 
    });
  } else {
    res.json({ 
      loggedIn: false 
    });
  }
});

module.exports = router;
