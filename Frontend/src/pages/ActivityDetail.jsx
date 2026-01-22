import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getActivityDetail, addToAnalyzed, removeFromAnalyzedByActivity, checkIfAnalyzed } from '../utils/apiCalls'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import GaugeChart from 'react-gauge-chart'
import 'leaflet/dist/leaflet.css'
import '../styles/ActivityDetail.css'

function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [analyzingLoading, setAnalyzingLoading] = useState(false)

  useEffect(() => {
    fetchActivityDetail()
    checkIfAnalyzedStatus()
  }, [id])

  const fetchActivityDetail = async () => {
    try {
      setLoading(true)
      const data = await getActivityDetail(id)
      setActivity(data)
    } catch (err) {
      setError(err.message || 'Error al cargar la actividad')
    } finally {
      setLoading(false)
    }
  }

  const checkIfAnalyzedStatus = async () => {
    if (!user || !user.id) return
    
    try {
      const data = await checkIfAnalyzed(user.id, id)
      setIsAnalyzed(data.isAnalyzed)
    } catch (err) {
      console.error('Error al verificar si está analizada:', err)
    }
  }

  const handleToggleAnalyzed = async () => {
    if (!user || !user.id || !activity) return

    setAnalyzingLoading(true)
    try {
      if (isAnalyzed) {
        // Quitar de analizadas
        await removeFromAnalyzedByActivity(user.id, id)
        setIsAnalyzed(false)
        alert('✅ Actividad eliminada de analizadas')
      } else {
        // Añadir a analizadas
        await addToAnalyzed({
          userId: user.id,
          activityId: id,
          activityName: activity.name,
          activityType: activity.type,
          distance: activity.distance,
          movingTime: activity.moving_time
        })
        setIsAnalyzed(true)
        alert('✅ Actividad añadida a analizadas')
      }
    } catch (err) {
      console.error('Error al actualizar actividad analizada:', err)
      alert('❌ Error: ' + (err.message || 'No se pudo actualizar'))
    } finally {
      setAnalyzingLoading(false)
    }
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
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(2)
  }

  const formatSpeed = (mps) => {
    if (!mps) return 'N/A'
    return (mps * 3.6).toFixed(2)
  }

  const formatPace = (mps) => {
    if (!mps) return 'N/A'
    const minPerKm = 1000 / (mps * 60)
    const mins = Math.floor(minPerKm)
    const secs = Math.floor((minPerKm - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')} min/km`
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

  // Datos simulados para gráficos (en producción vendrían del stream de datos de Strava)
  const generateMockData = () => {
    if (!activity) return []
    
    const points = 100 // Más puntos para mejor interactividad
    const data = []
    const distance = activity.distance / 1000
    const avgSpeed = activity.averageSpeed * 3.6
    const maxElevation = activity.totalElevationGain || 100
    
    for (let i = 0; i <= points; i++) {
      const distancePoint = (distance / points) * i
      const progress = i / points
      
      // Variación de velocidad más realista
      const speedVariation = Math.sin(progress * Math.PI * 3) * 8 + (Math.random() - 0.5) * 4
      const speed = Math.max(5, Math.min(avgSpeed * 1.5, avgSpeed + speedVariation))
      
      // Perfil de elevación más realista
      const elevationBase = Math.sin(progress * Math.PI * 2) * (maxElevation / 2)
      const elevationNoise = Math.sin(progress * Math.PI * 10) * (maxElevation / 10)
      const elevation = Math.max(0, elevationBase + elevationNoise + (maxElevation / 2))
      
      // Generar coordenadas simuladas para el mapa (en producción vendrían de la API)
      const baseLat = 40.4168 // Madrid como ejemplo
      const baseLon = -3.7038
      const lat = baseLat + (progress * 0.05) + (Math.random() - 0.5) * 0.01
      const lon = baseLon + (progress * 0.05) + (Math.random() - 0.5) * 0.01
      
      data.push({
        index: i,
        distance: distancePoint.toFixed(2),
        velocidad: speed.toFixed(1),
        elevacion: elevation.toFixed(0),
        ritmo: activity.averageHeartrate ? Math.max(100, (activity.averageHeartrate + (Math.random() - 0.5) * 15)).toFixed(0) : null,
        lat,
        lon
      })
    }
    
    return data
  }

  const chartData = generateMockData()
  
  // Extraer coordenadas para el mapa
  const routeCoordinates = chartData.map(point => [point.lat, point.lon])
  const centerPosition = routeCoordinates.length > 0 ? routeCoordinates[Math.floor(routeCoordinates.length / 2)] : [40.4168, -3.7038]

  // Manejar hover sobre el perfil de elevación
  const handleChartHover = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const point = data.activePayload[0].payload
      setHoveredPoint(point)
      const newSpeed = parseFloat(point.velocidad)
      console.log('🚴 Velocidad actualizada:', newSpeed, 'km/h')
      setCurrentSpeed(newSpeed)
    }
  }

  const handleChartLeave = () => {
    console.log('👋 Saliendo del gráfico, velocidad media:', activity.averageSpeed * 3.6)
    setHoveredPoint(null)
    setCurrentSpeed(activity ? activity.averageSpeed * 3.6 : 0)
  }

  useEffect(() => {
    if (activity) {
      setCurrentSpeed(activity.averageSpeed * 3.6)
    }
  }, [activity])

  if (loading) {
    return (
      <div className="activity-detail-loading">
        <div className="spinner"></div>
        <p>Cargando detalles de la actividad...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="activity-detail-error">
        <span>⚠️</span>
        <p>{error}</p>
        <button onClick={() => navigate('/activities')} className="back-button">
          Volver a Actividades
        </button>
      </div>
    )
  }

  if (!activity) return null

  return (
    <div className="activity-detail-page">
      <div className="detail-header">
        <div className="header-buttons">
          <button onClick={() => navigate('/activities')} className="back-button">
            ← Volver
          </button>
          
          <button 
            onClick={handleToggleAnalyzed}
            disabled={analyzingLoading}
            className={isAnalyzed ? 'analyzed-button active' : 'analyzed-button'}
          >
            {analyzingLoading ? '⏳' : isAnalyzed ? '✅ Analizada' : '📊 Marcar como Analizada'}
          </button>
        </div>
        <div className="header-content">
          <span className="activity-icon-large">{getActivityIcon(activity.type)}</span>
          <div>
            <h1>{activity.name}</h1>
            <p className="activity-date">{formatDate(activity.startDate)}</p>
          </div>
          <span className="activity-type-badge">{activity.type}</span>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card-large">
          <span className="metric-icon">📏</span>
          <div>
            <h3>{formatDistance(activity.distance)} km</h3>
            <p>Distancia</p>
          </div>
        </div>
        <div className="metric-card-large">
          <span className="metric-icon">⏱️</span>
          <div>
            <h3>{formatTime(activity.movingTime)}</h3>
            <p>Tiempo en Movimiento</p>
          </div>
        </div>
        <div className="metric-card-large">
          <span className="metric-icon">⚡</span>
          <div>
            <h3>{formatSpeed(activity.averageSpeed)} km/h</h3>
            <p>Velocidad Media</p>
          </div>
        </div>
        <div className="metric-card-large">
          <span className="metric-icon">🚀</span>
          <div>
            <h3>{formatSpeed(activity.maxSpeed)} km/h</h3>
            <p>Velocidad Máxima</p>
          </div>
        </div>
        {activity.totalElevationGain > 0 && (
          <div className="metric-card-large">
            <span className="metric-icon">⛰️</span>
            <div>
              <h3>{activity.totalElevationGain} m</h3>
              <p>Desnivel Positivo</p>
            </div>
          </div>
        )}
        {activity.type === 'Run' && (
          <div className="metric-card-large">
            <span className="metric-icon">🎯</span>
            <div>
              <h3>{formatPace(activity.averageSpeed)}</h3>
              <p>Ritmo Medio</p>
            </div>
          </div>
        )}
      </div>

      {/* Mapa de la ruta */}
      <div className="map-container">
        <h2>🗺️ Mapa de la ruta</h2>
        <div className="map-wrapper">
          <MapContainer 
            center={centerPosition} 
            zoom={13} 
            style={{ height: '100%', width: '100%', borderRadius: '10px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={routeCoordinates} color="#fc5200" weight={4} />
            {routeCoordinates.length > 0 && (
              <>
                <Marker position={routeCoordinates[0]}>
                  <Popup>🚀 Inicio</Popup>
                </Marker>
                <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                  <Popup>🏁 Fin</Popup>
                </Marker>
              </>
            )}
            {hoveredPoint && (
              <Marker position={[hoveredPoint.lat, hoveredPoint.lon]}>
                <Popup>
                  📍 Km {hoveredPoint.distance}<br/>
                  ⚡ {hoveredPoint.velocidad} km/h<br/>
                  ⛰️ {hoveredPoint.elevacion} m
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Sección combinada: Velocímetro + Perfil de Elevación */}
      <div className="interactive-section">
        <h2>📊 Análisis Interactivo de la Ruta</h2>
        <p className="interactive-hint">💡 Pasa el cursor sobre el perfil de elevación para ver la velocidad en cada punto</p>
        
        {/* Perfil de Elevación Interactivo - Ancho Completo */}
        <div className="elevation-profile-full">
          <h3>⛰️ Perfil de Elevación</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart 
              data={chartData}
              onMouseMove={handleChartHover}
              onMouseLeave={handleChartLeave}
            >
              <defs>
                <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fc5200" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fc5200" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="distance" 
                label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Elevación (m)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="custom-tooltip">
                        <p><strong>Distancia:</strong> {data.distance} km</p>
                        <p><strong>Elevación:</strong> {data.elevacion} m</p>
                        <p><strong>Velocidad:</strong> {data.velocidad} km/h</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area 
                type="monotone" 
                dataKey="elevacion" 
                stroke="#fc5200" 
                strokeWidth={2}
                fill="url(#colorElevation)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {hoveredPoint && (
            <div className="hovered-info-inline">
              <span>📍 {hoveredPoint.distance} km</span>
              <span>⛰️ {hoveredPoint.elevacion} m</span>
              <span>⚡ {hoveredPoint.velocidad} km/h</span>
            </div>
          )}
        </div>

        {/* Velocímetro Compacto Debajo */}
        <div className="speedometer-compact">
          <div className="speedometer-wrapper">
            <h4>⚡ Velocidad</h4>
            <div className="speed-display">
              <span className="speed-value-large">{currentSpeed.toFixed(1)}</span>
              <span className="speed-unit-large">km/h</span>
            </div>
            <div className="gauge-small">
              <GaugeChart 
                id="speed-gauge"
                key={currentSpeed}
                nrOfLevels={1}
                colors={["#e0e0e0", "#fc5200"]}
                arcWidth={0.25}
                percent={Math.min(currentSpeed / (activity.maxSpeed * 3.6 * 1.2), 1)}
                textColor="transparent"
                hideText={true}
                animate={false}
                arcsLength={[1]}
                needleColor="transparent"
                needleBaseColor="transparent"
              />
            </div>
          </div>
          <div className="speed-stats-compact">
            <div className="speed-stat-compact">
              <span className="stat-label">Media</span>
              <span className="stat-value">{formatSpeed(activity.averageSpeed)} km/h</span>
            </div>
            <div className="speed-stat-compact">
              <span className="stat-label">Máxima</span>
              <span className="stat-value">{formatSpeed(activity.maxSpeed)} km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Velocidad a lo largo de la ruta */}
      <div className="chart-container">
        <h2>📊 Velocidad a lo largo de la ruta</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Velocidad (km/h)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="velocidad" stroke="#fc5200" strokeWidth={2} name="Velocidad" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Ritmo Cardíaco */}
      <div className="chart-container">
        <h2>❤️ Ritmo cardíaco</h2>
        
        {activity.averageHeartrate ? (
          <>
            <div className="heartrate-stats">
              <div className="hr-stat">
                <span>Media:</span>
                <strong>{activity.averageHeartrate} bpm</strong>
              </div>
              {activity.maxHeartrate && (
                <div className="hr-stat">
                  <span>Máxima:</span>
                  <strong>{activity.maxHeartrate} bpm</strong>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="distance" label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ritmo" stroke="#e74c3c" strokeWidth={2} name="Ritmo Cardíaco (bpm)" />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="no-data-message">
            <p>📊 No hay datos de ritmo cardíaco para esta actividad</p>
            <p className="hint">💡 Usa un monitor de frecuencia cardíaca conectado a Strava para ver estos datos</p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="additional-info">
        <h2>ℹ️ Información adicional</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Tiempo Total:</span>
            <span className="info-value">{formatTime(activity.elapsedTime)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tiempo en Movimiento:</span>
            <span className="info-value">{formatTime(activity.movingTime)}</span>
          </div>
          {activity.calories && (
            <div className="info-item">
              <span className="info-label">Calorías:</span>
              <span className="info-value">{activity.calories} kcal</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">ID de Strava:</span>
            <span className="info-value">{activity.stravaId}</span>
          </div>
        </div>
      </div>

      {/* Botón de Análisis de Rendimiento */}
      <div className="performance-section">
        <button 
          className="performance-button"
          onClick={() => setShowPerformanceModal(true)}
        >
          🎯 Aplicar Nuevo Rendimiento
        </button>
      </div>

      {/* Modal de Rendimiento */}
      {showPerformanceModal && (
        <div className="modal-overlay" onClick={() => setShowPerformanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🎯 Análisis de Rendimiento</h2>
            <p>Aquí podrás aplicar análisis avanzados a tu actividad:</p>
            <ul>
              <li>Comparar con actividades similares</li>
              <li>Establecer objetivos de mejora</li>
              <li>Análisis de zonas de potencia/frecuencia cardíaca</li>
              <li>Recomendaciones personalizadas</li>
            </ul>
            <div className="modal-stats">
              <div className="modal-stat">
                <span>Eficiencia:</span>
                <strong>{((activity.distance / activity.movingTime) * 100).toFixed(1)}%</strong>
              </div>
              <div className="modal-stat">
                <span>Intensidad:</span>
                <strong>{activity.averageSpeed > 5 ? 'Alta' : activity.averageSpeed > 3 ? 'Media' : 'Baja'}</strong>
              </div>
            </div>
            <button onClick={() => setShowPerformanceModal(false)} className="close-modal-button">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityDetail
