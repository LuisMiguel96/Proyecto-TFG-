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
    type: Number,
  },
  elapsedTime: {
    type: Number,
  },
  
  // Distancia y velocidad
  distance: {
    type: Number,
    required: true
  },
  averageSpeed: {
    type: Number,
  },
  maxSpeed: {
    type: Number,
  },
  
  // Elevación
  totalElevationGain: {
    type: Number,
  },
  
  // Frecuencia cardíaca
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
  
  // Potencia (vatios)
  averageWatts: {
    type: Number,
  },
  weightedAverageWatts: {
    type: Number,
  },
  maxWatts: {
    type: Number,
  },
  kilojoules: {
    type: Number,
  },
  
  // Cadencia
  averageCadence: {
    type: Number,
  },
  
  // Dispositivo con potenciómetro
  deviceWatts: {
    type: Boolean,
    default: false
  },
  
  // Ubicación
  startLatlng: {
    type: [Number],
  },
  endLatlng: {
    type: [Number],
  },
  
  // Mapa
  mapPolyline: {
    type: String,
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('StravaActivity', stravaActivitySchema);