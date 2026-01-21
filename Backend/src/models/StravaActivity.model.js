// src/models/StravaActivity.model.js
const mongoose = require('mongoose');

const stravaActivitySchema = new mongoose.Schema({
  // Identificadores
  stravaId: {
    type: Number,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Información básica
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Run', 'Ride', 'Swim', 'Hike', 'Walk', 'Other'],
    required: true
  },
  
  // Fecha y tiempo
  startDate: {
    type: Date,
    required: true
  },
  movingTime: {
    type: Number, // segundos
    required: true
  },
  elapsedTime: {
    type: Number, // segundos
    required: true
  },
  
  // Distancia y velocidad
  distance: {
    type: Number, // metros
    required: true
  },
  averageSpeed: {
    type: Number, // m/s
  },
  maxSpeed: {
    type: Number, // m/s
  },
  
  // Elevación
  totalElevationGain: {
    type: Number, // metros
  },
  
  // Frecuencia cardíaca (si disponible)
  averageHeartrate: {
    type: Number,
  },
  maxHeartrate: {
    type: Number,
  },
  
  // Calorías
  calories: {
    type: Number,
  },
  
  // Ubicación
  startLatlng: {
    type: [Number], // [lat, lng]
  },
  endLatlng: {
    type: [Number],
  },
  
  // Mapa
  mapPolyline: {
    type: String, // Polyline encoded
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('StravaActivity', stravaActivitySchema);