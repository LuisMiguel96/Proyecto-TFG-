var express = require('express');
var axios = require('axios');
var User = require('../models/User.model');
var StravaActivity = require('../models/StravaActivity.model');

const router = express.Router();

// Endpoint para obtener la configuración pública de Strava
router.get('/config', (req, res) => {
  res.json({
    clientId: process.env.STRAVA_CLIENT_ID,
    redirectUri: process.env.STRAVA_REDIRECT_URI
  });
});

router.get('/connect', (req, res) => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:read_all,profile:read_all`;
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const { code, redirect_uri } = req.query;
  if (!code) return res.status(400).json({ error: 'Código no recibido' });
  
  // Usar el redirect_uri que envía el frontend, o el del .env como fallback
  const finalRedirectUri = redirect_uri || process.env.STRAVA_REDIRECT_URI;
  
  console.log('Intercambiando código con redirect_uri:', finalRedirectUri);
  
  try {
    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: finalRedirectUri
    });
    
    const { access_token, refresh_token, expires_at, athlete } = tokenResponse.data;
    
    const user = await User.findOneAndUpdate(
      { stravaId: athlete.id },
      {
        stravaId: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        profile: athlete.profile,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at
      },
      { upsert: true, new: true }
    );
    
    res.json({
      message: 'Conectado con Strava',
      user: { id: user._id, name: `${athlete.firstname} ${athlete.lastname}` }
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al conectar' });
  }
});

router.get('/activities/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    console.log('🔄 Sincronizando actividades desde Strava...');
    
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
      params: { per_page: 50 }
    });
    
    console.log(`📦 Recibidas ${response.data.length} actividades de Strava`);
    
    for (const activity of response.data) {
      const activityData = {
        stravaId: activity.id,
        userId: user._id,
        name: activity.name,
        type: activity.type,
        startDate: activity.start_date,
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        distance: activity.distance,
        averageSpeed: activity.average_speed,
        maxSpeed: activity.max_speed,
        totalElevationGain: activity.total_elevation_gain,
        // Datos de frecuencia cardíaca
        averageHeartrate: activity.average_heartrate,
        maxHeartrate: activity.max_heartrate,
        // Otros datos útiles
        // Calorías
       calories: activity.calories,
      // Potencia (vatios)
        averageWatts: activity.average_watts,
        weightedAverageWatts: activity.weighted_average_watts,
        maxWatts: activity.max_watts,
        kilojoules: activity.kilojoules,
        // Cadencia
        averageCadence: activity.average_cadence,
        deviceWatts: activity.device_watts || false,
        // Ubicación
        startLatlng: activity.start_latlng,
        endLatlng: activity.end_latlng,
        mapPolyline: activity.map?.summary_polyline,
        startLatlng: activity.start_latlng,
        endLatlng: activity.end_latlng,
        mapPolyline: activity.map?.summary_polyline
      };
      
      console.log(`💓 Actividad ${activity.name}: HR media=${activity.average_heartrate}, HR max=${activity.max_heartrate}`);
      
      await StravaActivity.findOneAndUpdate(
        { stravaId: activity.id },
        activityData,
        { upsert: true, new: true }
      );
    }
    
    res.json({ 
      message: `${response.data.length} actividades sincronizadas`,
      withHeartrate: response.data.filter(a => a.average_heartrate).length
    });
  } catch (error) {
    console.error('Error sincronizando actividades:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/streams/:userId/:stravaId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    const response = await axios.get(
      `https://www.strava.com/api/v3/activities/${req.params.stravaId}/streams`,
      {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        params: { keys: 'altitude,velocity_smooth,watts,distance,heartrate,cadence', key_by_type: true }
      }
    )

    res.json(response.data)
  } catch (error) {
    console.error('Error streams:', error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router;