const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    if (phone && typeof phone !== 'string') {
      return res.status(400).json({ error: 'Invalid phone' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, phone });

    await ActivityLog.create({ user: user._id, action: 'register', ip: req.ip, userAgent: req.headers['user-agent'] });

    res.status(201).json({ id: user._id, email: user.email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await ActivityLog.create({ user: user._id, action: 'login', ip: req.ip, userAgent: req.headers['user-agent'] });

    res.json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone, roles: user.roles, defaultRegion: user.defaultRegion } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('_id email name phone roles defaultRegion createdAt updatedAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Request password reset via phone (sends code)
router.post('/request-reset', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.resetCode = code;
    user.resetExpires = expires;
    await user.save();
    await ActivityLog.create({ user: user._id, action: 'request_reset', metadata: { phone }, ip: req.ip, userAgent: req.headers['user-agent'] });
    // In production, integrate SMS provider (e.g., Twilio) here.
    console.log(`Password reset code for ${phone}: ${code}`);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create reset code' });
  }
});

// Reset password with phone + code
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;
    if (!phone || !code || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ phone });
    if (!user || !user.resetCode || !user.resetExpires) return res.status(400).json({ error: 'Invalid reset request' });
    if (user.resetCode !== String(code)) return res.status(400).json({ error: 'Invalid code' });
    if (user.resetExpires.getTime() < Date.now()) return res.status(400).json({ error: 'Code expired' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetExpires = undefined;
    await user.save();
    await ActivityLog.create({ user: user._id, action: 'reset_password', metadata: { phone }, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
