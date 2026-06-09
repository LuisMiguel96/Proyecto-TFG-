import { useState, useEffect } from 'react'
import { getMLEstadisticasGlobales, getMLEstadisticasZonas } from '../utils/apiCalls'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import './MLDashboard.css'

function MLDashboard() {
  const [globales, setGlobales] = useState(null)
  const [zonas, setZonas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMLData()
  }, [])

  const fetchMLData = async () => {
    try {
      setLoading(true)
      const [dataGlobales, dataZonas] = await Promise.all([
        getMLEstadisticasGlobales(),
        getMLEstadisticasZonas()
      ])
      setGlobales(dataGlobales)
      setZonas(dataZonas)
    } catch (err) {
      setError('No se pudo conectar con la API de análisis ML')
    } finally {
      setLoading(false)
    }
  }

  const zonasFCData = zonas ? Object.entries(zonas.zonas_fc).map(([zona, registros]) => ({
    zona: zona.replace('zona_', 'Z'),
    registros
  })) : []

  const zonasPotenciaData = zonas ? Object.entries(zonas.zonas_potencia).map(([zona, registros]) => ({
    zona: zona.replace('zona_', 'Z'),
    registros
  })) : []

  if (loading) return <div className="ml-loading">⏳ Cargando análisis ML...</div>
  if (error) return <div className="ml-error">⚠️ {error}</div>

  return (
    <div className="ml-dashboard">
      <div className="ml-header">
        <h2>🤖 Análisis de Rendimiento ML</h2>
        <p className="ml-subtitle">Basado en datos de ciclistas profesionales</p>
      </div>

      {/* Métricas globales */}
      <div className="ml-metrics-grid">
        <div className="ml-metric-card">
          <span className="ml-metric-icon">🚴</span>
          <div>
            <h3>{globales.total_actividades}</h3>
            <p>Actividades analizadas</p>
          </div>
        </div>
        <div className="ml-metric-card">
          <span className="ml-metric-icon">📏</span>
          <div>
            <h3>{globales.distancia_total_km} km</h3>
            <p>Distancia total</p>
          </div>
        </div>
        <div className="ml-metric-card">
          <span className="ml-metric-icon">⚡</span>
          <div>
            <h3>{globales.potencia_media_global} w</h3>
            <p>Potencia media</p>
          </div>
        </div>
        <div className="ml-metric-card">
          <span className="ml-metric-icon">❤️</span>
          <div>
            <h3>{globales.fc_media_global} ppm</h3>
            <p>FC media global</p>
          </div>
        </div>
        <div className="ml-metric-card">
          <span className="ml-metric-icon">🎯</span>
          <div>
            <h3>{globales.w_por_kg_media_global} w/kg</h3>
            <p>Vatios por kilo</p>
          </div>
        </div>
        <div className="ml-metric-card">
          <span className="ml-metric-icon">📈</span>
          <div>
            <h3>{globales.eficiencia_media_global}</h3>
            <p>Eficiencia media</p>
          </div>
        </div>
      </div>

      {/* Gráficos de zonas */}
      <div className="ml-charts-grid">
        <div className="ml-chart-container">
          <h3>❤️ Distribución Zonas FC</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={zonasFCData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zona" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registros" fill="#fc5200" name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ml-chart-container">
          <h3>⚡ Distribución Zonas Potencia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={zonasPotenciaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zona" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registros" fill="#242428" name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default MLDashboard