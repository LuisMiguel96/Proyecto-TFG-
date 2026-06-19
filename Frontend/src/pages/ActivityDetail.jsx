import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getActivityDetail, addToAnalyzed, removeFromAnalyzedByActivity, checkIfAnalyzed } from '../utils/apiCalls'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import MLDashboard from '../components/MLDashboard'
import SpeedGauge from '../components/SpeedGauge'
import 'leaflet/dist/leaflet.css'
import '../styles/ActivityDetail.css'
import polyline from '@mapbox/polyline'
import axios from 'axios'

function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [analyzingLoading, setAnalyzingLoading] = useState(false)
  const [streams, setStreams] = useState(null)
  const gaugeRef = useRef(null)
  const lastMove = useRef(0)

  const updateSpeed = useCallback((speed) => {
    if (gaugeRef.current) gaugeRef.current.update(speed)
  }, [])

  const handleMouseMove = useCallback((e) => {
    const now = Date.now()
    if (now - lastMove.current < 30) return
    lastMove.current = now
    if (e && e.activePayload && e.activePayload[0]) {
      setHoveredPoint(e.activePayload[0].payload)
    }
  }, [])

  useEffect(() => {
    fetchActivityDetail()
    checkIfAnalyzedStatus()
  }, [id])

  const streamsLoaded = useRef(false)

  const fetchStreams = async (stravaId) => {
    if (streamsLoaded.current) return
    streamsLoaded.current = true
    try {
      const response = await axios.get(
        `http://localhost:3000/api/strava/streams/${user.id}/${stravaId}`
      )
      console.log('STREAMS:', response.data)
      setStreams(response.data)
    } catch (err) {
      console.error('Error cargando streams:', err)
    }
  }

  useEffect(() => {
    if (activity?.stravaId) {
      fetchStreams(activity.stravaId)
    }
  }, [activity?.stravaId])

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


  // Manejar hover sobre el perfil de elevación
  const handleChartHover = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const point = data.activePayload[0].payload
      setHoveredPoint(point)
      updateSpeed(parseFloat(point.velocidad))
    }
  }

  const handleChartLeave = () => {
    setHoveredPoint(null)
    if (activity) updateSpeed(activity.averageSpeed * 3.6)
  }

  useEffect(() => {
    if (activity) updateSpeed(activity.averageSpeed * 3.6)
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

  const FTP = 250
  const Peso = 75

  const chartData = streams?.distance
    ? streams.distance.data.map((dist, i) => {
      const vatios = streams.watts?.data[i] || 0
      const cadencia = streams.cadence?.data[i] || 0
      const fuerza = cadencia > 0 ? parseFloat((vatios / (cadencia * 2 * Math.PI / 60)).toFixed(1)) : 0
      return {
        distance: parseFloat((dist / 1000).toFixed(2)),
        elevacion: parseFloat(streams.altitude?.data[i]?.toFixed(0) || 0),
        velocidad: streams.velocity_smooth?.data[i]
          ? parseFloat((streams.velocity_smooth.data[i] * 3.6).toFixed(1)) : 0,
        vatios,
        cadencia,
        fuerza,
        ritmo: streams.heartrate?.data[i] ? parseFloat(streams.heartrate.data[i].toFixed(0)) : null
      }
    })
    : generateMockData()

  const zonasData = streams?.watts
    ? (() => {
      const zonas = [
        { zona: 'Z1 Recuperación', min: 0, max: FTP * 0.55, color: '#94a3b8' },
        { zona: 'Z2 Resistencia', min: FTP * 0.55, max: FTP * 0.75, color: '#22c55e' },
        { zona: 'Z3 Tempo', min: FTP * 0.75, max: FTP * 0.90, color: '#f59e0b' },
        { zona: 'Z4 Umbral', min: FTP * 0.90, max: FTP * 1.05, color: '#f97316' },
        { zona: 'Z5 VO2max', min: FTP * 1.05, max: Infinity, color: '#ef4444' },
      ]
      const total = streams.watts.data.length
      return zonas.map(z => ({
        zona: z.zona,
        porcentaje: parseFloat(
          (streams.watts.data.filter(w => w >= z.min && w < z.max).length / total * 100).toFixed(1)
        ),
        color: z.color
      }))
    })()
    : []

  const fatigaData = chartData.map((p, i) => ({
    ...p,
    fatiga: parseFloat((chartData.slice(0, i + 1).reduce((s, x) => s + x.vatios, 0) / ((i + 1) * FTP) * 100).toFixed(1))
  }))

  // Reducir puntos para legibilidad
  const sampleData = (data, maxPoints = 300) => {
    if (data.length <= maxPoints) return data
    const step = Math.floor(data.length / maxPoints)
    return data.filter((_, i) => i % step === 0)
  }

  const chartDataSampled = sampleData(chartData, 200)
  const fatigaDataSampled = sampleData(fatigaData, 300)

  const routeCoordinates = activity.mapPolyline
    ? polyline.decode(activity.mapPolyline)
    : []

  const centerPosition = routeCoordinates.length > 0
    ? routeCoordinates[Math.floor(routeCoordinates.length / 2)]
    : [40.4168, -3.7038]

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
        {activity.averageWatts && (
          <div className="metric-card-large">
            <span className="metric-icon">⚡</span>
            <div>
              <h3>{Math.round(activity.averageWatts)} W</h3>
              <p>Vatios Medios</p>
            </div>
          </div>
        )}
        {activity.weightedAverageWatts && (
          <div className="metric-card-large">
            <span className="metric-icon">💪</span>
            <div>
              <h3>{Math.round(activity.weightedAverageWatts)} W</h3>
              <p>Vatios Normalizados</p>
            </div>
          </div>
        )}
        {activity.maxWatts && (
          <div className="metric-card-large">
            <span className="metric-icon">🚀</span>
            <div>
              <h3>{activity.maxWatts} W</h3>
              <p>Vatios Máximos</p>
            </div>
          </div>
        )}
        {activity.kilojoules && (
          <div className="metric-card-large">
            <span className="metric-icon">🔋</span>
            <div>
              <h3>{Math.round(activity.kilojoules)} kJ</h3>
              <p>Energía Total</p>
            </div>
          </div>
        )}
        {activity.averageCadence && (
          <div className="metric-card-large">
            <span className="metric-icon">🔄</span>
            <div>
              <h3>{Math.round(activity.averageCadence)} rpm</h3>
              <p>Cadencia Media</p>
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
                  📍 Km {hoveredPoint.distance}<br />
                  ⚡ {hoveredPoint.velocidad} km/h<br />
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
          <ResponsiveContainer width="100%" height={350} style={{ overflow: 'visible' }}>
            <AreaChart
              data={chartData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleChartLeave}
            >
              <defs>
                <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fc5200" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fc5200" stopOpacity={0.1} />
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
                    updateSpeed(parseFloat(data.velocidad))
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
          <SpeedGauge ref={gaugeRef} maxSpeed={activity.maxSpeed} />
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
          <LineChart data={chartDataSampled}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Velocidad (km/h)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="velocidad" stroke="#fc5200" strokeWidth={2} name="Velocidad" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Vatios a lo largo de la ruta */}
      <div className="chart-container">
        <h2>⚡ Potencia a lo largo de la ruta</h2>
        <div className="heartrate-stats">
          <div className="hr-stat"><span>Media:</span><strong>{activity.averageWatts ? Math.round(activity.averageWatts) : Math.round(chartData.reduce((s, p) => s + p.vatios, 0) / chartData.length)} W</strong></div>
          <div className="hr-stat"><span>Máx:</span><strong>{Math.max(...chartData.map(p => p.vatios))} W</strong></div>
          <div className="hr-stat"><span>FTP ref.:</span><strong>{FTP} W</strong></div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartDataSampled}>
            <defs>
              <linearGradient id="vatiosGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Vatios (W)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(v) => [`${v}W`, 'Potencia']} />
            <ReferenceLine y={FTP} stroke="#020d2eff" strokeDasharray="5 5" />
            <Area type="monotone" dataKey="vatios" stroke="#f59e0b" strokeWidth={2} fill="url(#vatiosGrad)" name="Vatios" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Zonas de potencia */}
      <div className="chart-container">
        <h2>🏋️ Distribución por zonas de potencia</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={zonasData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%" domain={[0, 100]} />
            <YAxis type="category" dataKey="zona" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Tiempo']} />
            <Bar dataKey="porcentaje" radius={[0, 6, 6, 0]}>
              {zonasData.map((z, i) => (
                <Cell key={i} fill={z.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cadencia y Fuerza */}
      <div className="chart-container">
        <h2>🔄 Cadencia y Fuerza</h2>
        <div className="heartrate-stats">
          <div className="hr-stat"><span>Cadencia media:</span><strong>{Math.round(chartData.reduce((s, p) => s + p.cadencia, 0) / chartData.length)} rpm</strong></div>
          <div className="hr-stat"><span>Fuerza media:</span><strong>{Math.round(chartData.filter(p => p.fuerza > 0).reduce((s, p) => s + p.fuerza, 0) / chartData.filter(p => p.fuerza > 0).length)} Nm</strong></div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -5 }} />
            <YAxis yAxisId="cad" label={{ value: 'rpm', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="fuerza" orientation="right" label={{ value: 'Nm', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="cad" type="monotone" dataKey="cadencia" stroke="#8b5cf6" strokeWidth={2} name="Cadencia (rpm)" dot={false} />
            <Line yAxisId="fuerza" type="monotone" dataKey="fuerza" stroke="#f59e0b" strokeWidth={2} name="Fuerza (Nm)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fatiga acumulada */}
      <div className="chart-container">
        <h2>😓 Fatiga acumulada</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Porcentaje de esfuerzo acumulado respecto al FTP de referencia ({FTP}W)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={fatigaData}>
            <defs>
              <linearGradient id="fatigaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Fatiga (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Fatiga']} />
            <Area type="monotone" dataKey="fatiga" stroke="#ef4444" strokeWidth={2} fill="url(#fatigaGrad)" name="Fatiga" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Modal de Rendimiento */}

    </div >
  )
}


export default ActivityDetail
