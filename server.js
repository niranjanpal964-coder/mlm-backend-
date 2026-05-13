require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ এই 2টা Line Add কর
const authRoutes = require('./routes/auth'); 
app.use('/api/auth', authRoutes);

// MongoDB Connection - Safe Way
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('Welcome to MLM Backend - Server is Running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
