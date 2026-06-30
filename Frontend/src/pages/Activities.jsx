import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Activities.css'

function Activities() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('Ride')

  useEffect(() => {
    if (user && user.id) fetchActivities(user.id)
  }, [user, filterType])

  const fetchActivities = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const url = filterType === 'all'
        ? `http://localhost:3000/api/activities/${id}`
        : `http://localhost:3000/api/activities/${id}/type/${filterType}`
      const response = await axios.get(url)
      setActivities(response.data.activities)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar actividades')
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter(activity => activity.type === filterType)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (meters) => (meters / 1000).toFixed(2)
  const formatSpeed = (mps) => mps ? (mps * 3.6).toFixed(2) : 'N/A'

  const getActivityIcon = (type) => {
    const icons = { 'Run': '🏃', 'Ride': '🚴', 'Swim': '🏊', 'Hike': '🥾', 'Walk': '🚶' }
    return icons[type] || '⚡'
  }

  return (
    <div className="activities-page">

      {/* Header */}
      <div className="activities-header">
        <div className="activities-header-inner">
          <div>
            <div className="page-label">Strava Sync</div>
            <h1>Mis Actividades</h1>
            <p>Visualiza y analiza tus entrenamientos sincronizados desde Strava</p>
          </div>
          {user && (
            <div className="user-chip">
              <img src={user?.profile || ''} alt="" className="user-chip-avatar" />
              <div>
                <div className="user-chip-name">{user?.firstname} {user?.lastname}</div>
                <div className="user-chip-status">✓ Conectado</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="activities-content">

        {/* Filtro */}
        <div className="filter-bar">
          <span className="filter-label">Tipo de actividad</span>
          <div className="filter-options">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'Ride', label: '🚴 Bicicleta' },
              { value: 'Run', label: '🏃 Carrera' },
              { value: 'Swim', label: '🏊 Natación' },
              { value: 'Hike', label: '🥾 Senderismo' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`filter-btn ${filterType === opt.value ? 'active' : ''}`}
                onClick={() => setFilterType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Cargando actividades...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-state">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && filteredActivities.length > 0 && (
          <>
            <div className="stats-row">
              {[
                { value: filteredActivities.length, label: 'Actividades' },
                { value: `${(filteredActivities.reduce((s, a) => s + a.distance, 0) / 1000).toFixed(0)} km`, label: 'Distancia total' },
                { value: `${Math.floor(filteredActivities.reduce((s, a) => s + a.movingTime, 0) / 3600)}h`, label: 'Tiempo total' },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabla */}
            <div className="table-wrap">
              <table className="activities-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Distancia</th>
                    <th>Tiempo</th>
                    <th>Vel. media</th>
                    <th>Desnivel</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map(activity => (
                    <tr key={activity._id}>
                      <td className="icon-cell">{getActivityIcon(activity.type)}</td>
                      <td className="name-cell">{activity.name}</td>
                      <td className="date-cell">{formatDate(activity.startDate)}</td>
                      <td className="num-cell">{formatDistance(activity.distance)} km</td>
                      <td className="num-cell">{formatTime(activity.movingTime)}</td>
                      <td className="num-cell">{formatSpeed(activity.averageSpeed)} km/h</td>
                      <td className="num-cell">{activity.totalElevationGain || 0} m</td>
                      <td>
                        <button
                          className="detail-btn"
                          onClick={() => navigate(`/activity/${activity._id}`)}
                        >
                          Ver →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Vacío */}
        {!loading && !error && filteredActivities.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🚴</div>
            <h3>No hay actividades</h3>
            <p>No se encontraron actividades para el filtro seleccionado</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Activities