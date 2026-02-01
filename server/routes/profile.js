const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile - Get user profile
router.get('/', requireAuth, (req, res) => {
  try {
    const profile = db.prepare(
      'SELECT data_json, updated_at FROM profiles WHERE user_id = ?'
    ).get(req.session.userId);

    if (!profile) {
      return res.json({ profile: null });
    }

    res.json({ 
      profile: profile.data_json ? JSON.parse(profile.data_json) : {},
      updated_at: profile.updated_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve profile' 
    });
  }
});

// PUT /api/profile - Update user profile
router.put('/', requireAuth, (req, res) => {
  try {
    const profileData = req.body;
    const data_json = JSON.stringify(profileData);
    const updated_at = new Date().toISOString();

    // Check if profile exists
    const existing = db.prepare(
      'SELECT id FROM profiles WHERE user_id = ?'
    ).get(req.session.userId);

    if (existing) {
      // Update existing profile
      db.prepare(
        'UPDATE profiles SET data_json = ?, updated_at = ? WHERE user_id = ?'
      ).run(data_json, updated_at, req.session.userId);
    } else {
      // Create new profile
      db.prepare(
        'INSERT INTO profiles (user_id, data_json, updated_at) VALUES (?, ?, ?)'
      ).run(req.session.userId, data_json, updated_at);
    }

    res.json({ 
      message: 'Profile updated successfully',
      profile: profileData,
      updated_at
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
});

module.exports = router;
