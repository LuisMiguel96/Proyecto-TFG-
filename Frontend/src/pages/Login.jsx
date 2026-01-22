import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stravaConfig, setStravaConfig] = useState(null)

  // Obtener la configuración de Strava desde el backend
  useEffect(() => {
    const fetchStravaConfig = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/strava/config')
        setStravaConfig(response.data)
      } catch (err) {
        console.error('Error al obtener configuración de Strava:', err)
        setError('No se pudo cargar la configuración de Strava')
      }
    }
    
    fetchStravaConfig()
  }, [])

  const handleStravaLogin = async () => {
    if (!stravaConfig) {
      setError('La configuración de Strava no está disponible')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Redirigir a la autenticación de Strava
      const redirectUri = `${window.location.origin}/callback`
      const scope = 'activity:read_all,profile:read_all'
      
      const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaConfig.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
      
      window.location.href = stravaAuthUrl
    } catch (err) {
      setError('Error al conectar con Strava')
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    // Login de demostración con el usuario por defecto
    const demoUser = {
      id: '691efd4fb201b176b7ba94a0',
      firstname: 'Usuario',
      lastname: 'Demo',
      profile: 'https://via.placeholder.com/150'
    }
    
    login(demoUser)
    navigate('/activities')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-section">
            <span className="logo-icon">🚴</span>
            <h1>Strava Analytics</h1>
          </div>
          <p className="login-subtitle">Analiza tus actividades deportivas con datos interactivos</p>
        </div>

        <div className="login-card">
          <h2>Iniciar Sesión</h2>
          
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <button 
            onClick={handleStravaLogin}
            className="strava-login-btn"
            disabled={loading}
          >
            <svg className="strava-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
            {loading ? 'Conectando...' : 'Conectar con Strava'}
          </button>

          <div className="login-divider">
            <span>O</span>
          </div>

          <button 
            onClick={handleDemoLogin}
            className="demo-login-btn"
          >
            <span>🎯</span>
            Acceder como Demo
          </button>

          <p className="login-info">
            💡 Usa el modo demo para explorar la aplicación con datos de ejemplo
          </p>
        </div>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Análisis Detallado</h3>
            <p>Visualiza mapas, perfiles de elevación y gráficos interactivos</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <h3>Métricas en Tiempo Real</h3>
            <p>Velocidad, ritmo cardíaco y más</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🗺️</span>
            <h3>Mapas Interactivos</h3>
            <p>Explora tus rutas con detalle</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
