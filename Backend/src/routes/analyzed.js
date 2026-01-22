const express = require('express');
const router = express.Router();
const AnalyzedActivity = require('../models/AnalyzedActivity.model');

/**
 * POST /api/analyzed
 * Añadir una actividad a la lista de analizadas
 */
router.post('/', async (req, res) => {
  try {
    const { userId, activityId, activityName, activityType, distance, movingTime } = req.body;

    // Validación básica
    if (!userId || !activityId || !activityName || !activityType) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: userId, activityId, activityName, activityType' 
      });
    }

    // Verificar si ya está analizada
    const exists = await AnalyzedActivity.findOne({ userId, activityId });
    if (exists) {
      return res.status(400).json({ 
        error: 'Esta actividad ya está en tu lista de analizadas' 
      });
    }

    // Crear nueva actividad analizada
    const analyzedActivity = new AnalyzedActivity({
      userId,
      activityId,
      activityName,
      activityType,
      distance,
      movingTime
    });

    await analyzedActivity.save();

    console.log(`✅ Actividad ${activityId} añadida a analizadas para usuario ${userId}`);
    res.status(201).json({ 
      message: 'Actividad añadida a analizadas exitosamente',
      data: analyzedActivity 
    });

  } catch (error) {
    console.error('❌ Error al añadir actividad a analizadas:', error);
    res.status(500).json({ 
      error: 'Error al añadir actividad a analizadas',
      details: error.message 
    });
  }
});

/**
 * GET /api/analyzed/:userId
 * Obtener todas las actividades analizadas de un usuario
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const analyzedActivities = await AnalyzedActivity.find({ userId })
      .sort({ analyzedAt: -1 }); // Más recientes primero

    console.log(`✅ ${analyzedActivities.length} actividades analizadas encontradas para usuario ${userId}`);
    res.json(analyzedActivities);

  } catch (error) {
    console.error('❌ Error al obtener actividades analizadas:', error);
    res.status(500).json({ 
      error: 'Error al obtener actividades analizadas',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/analyzed/:id
 * Eliminar una actividad de la lista de analizadas
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AnalyzedActivity.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Actividad analizada no encontrada' 
      });
    }

    console.log(`✅ Actividad analizada ${id} eliminada exitosamente`);
    res.json({ 
      message: 'Actividad eliminada de analizadas exitosamente',
      data: deleted 
    });

  } catch (error) {
    console.error('❌ Error al eliminar actividad analizada:', error);
    res.status(500).json({ 
      error: 'Error al eliminar actividad analizada',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/analyzed/activity/:userId/:activityId
 * Eliminar una actividad específica de un usuario (por userId y activityId)
 */
router.delete('/activity/:userId/:activityId', async (req, res) => {
  try {
    const { userId, activityId } = req.params;

    const deleted = await AnalyzedActivity.findOneAndDelete({ userId, activityId });

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Actividad analizada no encontrada' 
      });
    }

    console.log(`✅ Actividad ${activityId} eliminada de analizadas para usuario ${userId}`);
    res.json({ 
      message: 'Actividad eliminada de analizadas exitosamente',
      data: deleted 
    });

  } catch (error) {
    console.error('❌ Error al eliminar actividad analizada:', error);
    res.status(500).json({ 
      error: 'Error al eliminar actividad analizada',
      details: error.message 
    });
  }
});

/**
 * GET /api/analyzed/check/:userId/:activityId
 * Verificar si una actividad está en la lista de analizadas
 */
router.get('/check/:userId/:activityId', async (req, res) => {
  try {
    const { userId, activityId } = req.params;

    const exists = await AnalyzedActivity.findOne({ userId, activityId });

    res.json({ 
      isAnalyzed: !!exists,
      data: exists 
    });

  } catch (error) {
    console.error('❌ Error al verificar actividad analizada:', error);
    res.status(500).json({ 
      error: 'Error al verificar actividad analizada',
      details: error.message 
    });
  }
});

module.exports = router;
