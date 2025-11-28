const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    phone: { type: String, index: true },
    roles: { type: [String], default: ['user'] },
    // For phone-based password reset
    resetCode: { type: String },
    resetExpires: { type: Date },
    // User preferences
    defaultRegion: {
      country: { type: String },
      division: { type: String },
      zilla: { type: String },
      upazila: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
