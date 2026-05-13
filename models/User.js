const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // MLM Fields
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null },
  leftUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rightUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // Earning
  wallet: { type: Number, default: 0 },
  totalEarning: { type: Number, default: 0 },
  joinAmount: { type: Number, default: 1000 },
  
  createdAt: { type: Date, default: Date.now }
});

// Auto Referral Code Generate
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = 'MLM' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
