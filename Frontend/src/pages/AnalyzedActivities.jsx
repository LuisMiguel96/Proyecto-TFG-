import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAnalyzedActivities, removeFromAnalyzed } from '../utils/apiCalls'
import '../styles/AnalyzedActivities.css'

function AnalyzedActivities() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [analyzedActivities, setAnalyzedActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && user.id) {
      fetchAnalyzedActivities()
    }
  }, [user])

  const fetchAnalyzedActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAnalyzedActivities(user.id)
      setAnalyzedActivities(data)
    } catch (err) {
      setError(err.message || 'Error al cargar actividades analizadas')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromAnalyzed = async (analyzedId, activityName) => {
    const confirmed = window.confirm(`¿Eliminar "${activityName}" de analizadas?`)
    if (!confirmed) return

    try {
      await removeFromAnalyzed(analyzedId)
      // Actualizar la lista
      setAnalyzedActivities(prev => prev.filter(item => item._id !== analyzedId))
      alert('✅ Actividad eliminada de analizadas')
    } catch (err) {
      alert('❌ Error al eliminar: ' + (err.message || 'Error desconocido'))
    }
  }
  const handleViewDetail = (activityId) => {
    navigate(`/performance?activityId=${activityId}`)
  }
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDistance = (meters) => {
    if (!meters) return 'N/A'
    return (meters / 1000).toFixed(2)
  }

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getActivityIcon = (type) => {
    const icons = {
      'Ride': '🚴',
      'Run': '🏃',
      'Swim': '🏊',
      'Walk': '🚶',
      'Hike': '🥾',
      'default': '⚡'
    }
    return icons[type] || icons.default
  }

  if (loading) {
    return (
      <div className="analyzed-loading">
        <div className="spinner"></div>
        <p>Cargando actividades analizadas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analyzed-error">
        <span>⚠️</span>
        <p>{error}</p>
        <button onClick={() => navigate('/activities')} className="back-button">
          Volver a Actividades
        </button>
      </div>
    )
  }

  return (
    <div className="analyzed-activities-page">
      <div className="analyzed-header">
        <h1>📊 Actividades Analizadas</h1>
        <p>Gestiona tus actividades marcadas para análisis</p>
      </div>

      <div className="analyzed-content">
        {analyzedActivities.length === 0 ? (
          <div className="no-analyzed">
            <div className="no-analyzed-icon">📭</div>
            <h2>No hay actividades analizadas</h2>
            <p>Ve a la página de actividades y marca alguna como "Analizada"</p>
            <button onClick={() => navigate('/activities')} className="go-activities-btn">
              Ir a Mis Actividades
            </button>
          </div>
        ) : (
          <>
            <div className="analyzed-stats">
              <div className="stat-card">
                <h3>{analyzedActivities.length}</h3>
                <p>Actividades Analizadas</p>
              </div>
              <div className="stat-card">
                <h3>{analyzedActivities.filter(a => a.activityType === 'Ride').length}</h3>
                <p>Ciclismo</p>
              </div>
              <div className="stat-card">
                <h3>{analyzedActivities.filter(a => a.activityType === 'Run').length}</h3>
                <p>Carrera</p>
              </div>
            </div>

            <div className="table-container">
              <table className="analyzed-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nombre</th>
                    <th>Distancia</th>
                    <th>Tiempo</th>
                    <th>Fecha Análisis</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {analyzedActivities.map((item) => (
                    <tr key={item._id}>
                      <td className="icon-cell">{getActivityIcon(item.activityType)}</td>
                      <td className="name-cell">{item.activityName}</td>
                      <td className="number-cell">{formatDistance(item.distance)} km</td>
                      <td className="number-cell">{formatTime(item.movingTime)}</td>
                      <td className="date-cell">{formatDate(item.analyzedAt)}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleViewDetail(item.activityId)}
                          className="view-btn"
                          title="Ver detalles"
                        >
                          👁️ Ver
                        </button>
                        <button
                          onClick={() => navigate(`/performance?activityId=${item.activityId}`)}
                          className="view-btn"
                          title="Analizar rendimiento"
                          style={{ background: '#6366f1', color: 'white', marginLeft: '4px' }}
                        >
                          🎯 Analizar
                        </button>
                        <button
                          onClick={() => handleRemoveFromAnalyzed(item._id, item.activityName)}
                          className="remove-btn"
                          title="Quitar de analizadas"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AnalyzedActivities
