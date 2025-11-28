const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

const router = express.Router();

// Get my profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('_id email name phone roles defaultRegion createdAt updatedAt');
  res.json({ user });
});

// Update my profile (name, phone)
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, defaultRegion } = req.body;
    const updates = {};
    if (typeof name === 'string') updates.name = name;
    if (typeof phone === 'string') updates.phone = phone;
    if (defaultRegion && typeof defaultRegion === 'object') {
      updates.defaultRegion = {
        country: defaultRegion.country,
        division: defaultRegion.division,
        zilla: defaultRegion.zilla,
        upazila: defaultRegion.upazila,
      };
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('_id email name phone roles defaultRegion createdAt updatedAt');
    await ActivityLog.create({ user: req.user.id, action: 'update_profile', metadata: updates });
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Current password incorrect' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    await ActivityLog.create({ user: req.user.id, action: 'change_password' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
