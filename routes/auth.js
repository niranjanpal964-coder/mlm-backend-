const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    console.log('Hash মিলে গেছে 🔐');
    const token = jwt.sign({ id: user._id }, 'my_secret_key_123');
    console.log('Token পাঠাচ্ছি');
    
    return res.status(200).json({ token, msg: 'Login Success' });
  } catch (err) {
    console.log('Server Error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// REGISTER WITH REFERRAL
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    
    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode });
      if (!referredByUser) return res.status(400).json({ msg: 'Invalid Referral Code' });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPass, referredBy: referralCode || null });
    await newUser.save();

    if (referredByUser) {
      if (!referredByUser.leftUser) {
        referredByUser.leftUser = newUser._id;
      } else if (!referredByUser.rightUser) {
        referredByUser.rightUser = newUser._id;
      }
      referredByUser.wallet += 300;
      referredByUser.totalEarning += 300;
      await referredByUser.save();
      console.log('300 Taka Bonus Added to:', referredByUser.email);
    }

    res.json({ msg: 'Register Success', referralCode: newUser.referralCode });
  } catch (err) {
    console.log('Register Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET PROFILE FOR DASHBOARD
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });

    const decoded = jwt.verify(token, 'my_secret_key_123');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const leftCount = user.leftUser ? 1 : 0;
    const rightCount = user.rightUser ? 1 : 0;

    res.json({
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      wallet: user.wallet,
      totalEarning: user.totalEarning,
      team: { left: leftCount, right: rightCount }
    });
  } catch (err) {
    res.status(400).json({ msg: 'Token not valid' });
  }
});

module.exports = router;
