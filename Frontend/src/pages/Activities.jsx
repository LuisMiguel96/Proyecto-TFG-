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
  const [filterType, setFilterType] = useState('Ride') // Por defecto: Solo bicicleta

  // Debug: Ver qué usuario tenemos
  console.log('Activities - Current user:', user)

  useEffect(() => {
    if (user && user.id) {
      console.log('Activities - Fetching for user ID:', user.id)
      fetchActivities(user.id)
    } else {
      console.log('Activities - No user or user.id')
    }
  }, [user, filterType])

  const fetchActivities = async (id) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching activities for user:', id, 'Filter:', filterType)
      
      // Si filterType es 'all', trae todas, sino filtra por tipo
      const url = filterType === 'all' 
        ? `http://localhost:3000/api/activities/${id}`
        : `http://localhost:3000/api/activities/${id}/type/${filterType}`
      
      const response = await axios.get(url)
      console.log('Activities response:', response.data)
      setActivities(response.data.activities)
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError(err.response?.data?.error || 'Error al cargar actividades')
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filterType)

  const activityTypes = [...new Set(activities.map(a => a.type))]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(2)
  }

  const formatSpeed = (mps) => {
    if (!mps) return 'N/A'
    return (mps * 3.6).toFixed(2)
  }

  const getActivityIcon = (type) => {
    const icons = {
      'Run': '🏃',
      'Ride': '🚴',
      'Swim': '🏊',
      'Hike': '🥾',
      'Walk': '🚶',
      'Other': '⚡'
    }
    return icons[type] || '⚡'
  }

  return (
    <div className="activities-page">
      <div className="activities-header">
        <h1>Mis Actividades Deportivas</h1>
        <p>Visualiza y analiza tus entrenamientos sincronizados desde Strava</p>
      </div>

      {/* Debug info */}
      {!user && (
        <div className="error-message">
          <span>⚠️</span>
          <p>No hay usuario autenticado. Por favor, inicia sesión.</p>
        </div>
      )}

      {/* Card de Usuario Conectado */}
      {user && (
        <div className="user-info-card-simple">
          <div className="user-info-header">
            <div className="user-avatar">
              <img 
                src={user?.profile || 'https://via.placeholder.com/60'} 
                alt={`${user?.firstname} ${user?.lastname}`}
              />
            </div>
            <div className="user-details">
              <h3>{user?.firstname} {user?.lastname}</h3>
              <p className="user-status">✓ Conectado (ID: {user?.id})</p>
            </div>
          </div>

          {/* Filtro por tipo de actividad */}
          <div className="filter-section-inline">
            <label>Tipo de Actividad:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las actividades</option>
              <option value="Ride">🚴 Solo Bicicleta</option>
              <option value="Run">🏃 Solo Carrera</option>
              <option value="Swim">🏊 Solo Natación</option>
              <option value="Hike">🥾 Solo Senderismo</option>
              <option value="Walk">🚶 Solo Caminata</option>
            </select>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando actividades...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && activities.length > 0 && (
        <>
          <div className="activities-stats">
            <div className="stat-card">
              <h3>{filteredActivities.length}</h3>
              <p>Actividades</p>
            </div>
            <div className="stat-card">
              <h3>{(filteredActivities.reduce((sum, a) => sum + a.distance, 0) / 1000).toFixed(2)}</h3>
              <p>Km Totales</p>
            </div>
            <div className="stat-card">
              <h3>{Math.floor(filteredActivities.reduce((sum, a) => sum + a.movingTime, 0) / 3600)}</h3>
              <p>Horas</p>
            </div>
          </div>

          <div className="table-container">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Distancia (km)</th>
                  <th>Tiempo</th>
                  <th>Vel. Media (km/h)</th>
                  <th>Desnivel (m)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map(activity => (
                  <tr key={activity._id}>
                    <td className="icon-cell">{getActivityIcon(activity.type)}</td>
                    <td className="name-cell">{activity.name}</td>
                    <td>{formatDate(activity.startDate)}</td>
                    <td className="number-cell">{formatDistance(activity.distance)}</td>
                    <td>{formatTime(activity.movingTime)}</td>
                    <td className="number-cell">{formatSpeed(activity.averageSpeed)}</td>
                    <td className="number-cell">{activity.totalElevationGain || 0}</td>
                    <td>
                      <button 
                        className="view-details-btn"
                        onClick={() => navigate(`/activity/${activity._id}`)}
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !error && activities.length === 0 && user && (
        <div className="no-activities">
          <p>No se encontraron actividades para este usuario</p>
          <p>ID de usuario: {user.id}</p>
        </div>
      )}
    </div>
  )
}

export default Activities
