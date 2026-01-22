import { useNavigate } from 'react-router-dom'
import './ActivityCard.css'

function ActivityCard({ activity }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/activity/${activity._id}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
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
    return (mps * 3.6).toFixed(2) // convertir m/s a km/h
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
    <div className="activity-card" onClick={handleClick}>
      <div className="activity-header">
        <span className="activity-icon">{getActivityIcon(activity.type)}</span>
        <div className="activity-title-section">
          <h3>{activity.name}</h3>
          <span className="activity-type">{activity.type}</span>
        </div>
      </div>

      <div className="activity-date">
        📅 {formatDate(activity.startDate)}
      </div>

      <div className="activity-metrics">
        <div className="metric">
          <span className="metric-icon">📏</span>
          <div className="metric-info">
            <span className="metric-value">{formatDistance(activity.distance)} km</span>
            <span className="metric-label">Distancia</span>
          </div>
        </div>

        <div className="metric">
          <span className="metric-icon">⏱️</span>
          <div className="metric-info">
            <span className="metric-value">{formatTime(activity.movingTime)}</span>
            <span className="metric-label">Tiempo en Movimiento</span>
          </div>
        </div>

        <div className="metric">
          <span className="metric-icon">⚡</span>
          <div className="metric-info">
            <span className="metric-value">{formatSpeed(activity.averageSpeed)} km/h</span>
            <span className="metric-label">Velocidad Media</span>
          </div>
        </div>

        <div className="metric">
          <span className="metric-icon">🚀</span>
          <div className="metric-info">
            <span className="metric-value">{formatSpeed(activity.maxSpeed)} km/h</span>
            <span className="metric-label">Velocidad Máxima</span>
          </div>
        </div>

        {activity.totalElevationGain > 0 && (
          <div className="metric">
            <span className="metric-icon">⛰️</span>
            <div className="metric-info">
              <span className="metric-value">{activity.totalElevationGain} m</span>
              <span className="metric-label">Desnivel</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityCard
