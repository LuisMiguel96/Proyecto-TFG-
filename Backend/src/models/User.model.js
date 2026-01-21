// src/models/User.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  stravaId: {
    type: Number,
    required: true,
    unique: true
  },
  firstname: String,
  lastname: String,
  profile: String, // URL foto
  
  // Tokens de Strava
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Number, // timestamp
    required: true
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);