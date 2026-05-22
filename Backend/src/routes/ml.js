var express = require('express');
var axios = require('axios');
const router = express.Router();

const ML_API = 'http://localhost:8000';

// GET estadísticas globales
router.get('/estadisticas/globales', async (req, res) => {
    try {
        const response = await axios.get(`${ML_API}/estadisticas/globales`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con la API de ML' });
    }
});

// GET estadísticas de zonas
router.get('/estadisticas/zonas', async (req, res) => {
    try {
        const response = await axios.get(`${ML_API}/estadisticas/zonas`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET lista de actividades ML
router.get('/actividades', async (req, res) => {
    try {
        const response = await axios.get(`${ML_API}/actividades`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET resumen de una actividad
router.get('/actividades/:archivo/resumen', async (req, res) => {
    try {
        const response = await axios.get(`${ML_API}/actividades/${req.params.archivo}/resumen`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET serie temporal de una actividad
router.get('/actividades/:archivo/serie', async (req, res) => {
    try {
        const response = await axios.get(`${ML_API}/actividades/${req.params.archivo}/serie`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;