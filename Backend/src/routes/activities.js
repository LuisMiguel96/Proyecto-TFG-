var express = require('express');
var StravaActivity = require('../models/StravaActivity.model');
var User = require('../models/User.model');

const router = express.Router();

// GET todas las actividades de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const activities = await StravaActivity.find({ userId: user._id })
      .sort({ startDate: -1 }); // Ordenadas por fecha descendente
    
    res.json({
      total: activities.length,
      activities: activities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET una actividad específica por ID
router.get('/detail/:activityId', async (req, res) => {
  try {
    const activity = await StravaActivity.findById(req.params.activityId);
    if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET actividades filtradas por tipo (Run, Ride, Swim, etc.)
router.get('/:userId/type/:activityType', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const activities = await StravaActivity.find({ 
      userId: user._id,
      type: req.params.activityType 
    }).sort({ startDate: -1 });
    
    res.json({
      type: req.params.activityType,
      total: activities.length,
      activities: activities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
