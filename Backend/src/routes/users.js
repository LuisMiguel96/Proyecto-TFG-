var express = require('express');
var User = require('../models/User.model');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET user by ID */
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    res.json({
      id: user._id,
      stravaId: user.stravaId,
      firstname: user.firstname,
      lastname: user.lastname,
      profile: user.profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
