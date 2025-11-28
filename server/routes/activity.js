const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

const router = express.Router();

// Create an activity log entry
router.post('/', auth, async (req, res) => {
  try {
    const { action, metadata } = req.body;
    const log = await ActivityLog.create({
      user: req.user?.id || undefined,
      action,
      metadata,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.status(201).json(log);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Get current user's logs
router.get('/', auth, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Clear current user's logs
router.delete('/', auth, async (req, res) => {
  try {
    const result = await ActivityLog.deleteMany({ user: req.user.id });
    res.json({ deleted: result.deletedCount || 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

module.exports = router;
