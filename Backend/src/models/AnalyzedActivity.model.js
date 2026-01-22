const mongoose = require('mongoose');

const analyzedActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  activityId: {
    type: String,
    required: true
  },
  activityName: {
    type: String,
    required: true
  },
  activityType: {
    type: String,
    required: true
  },
  distance: {
    type: Number
  },
  movingTime: {
    type: Number
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados: un usuario no puede analizar la misma actividad dos veces
analyzedActivitySchema.index({ userId: 1, activityId: 1 }, { unique: true });

const AnalyzedActivity = mongoose.model('AnalyzedActivity', analyzedActivitySchema);

module.exports = AnalyzedActivity;
