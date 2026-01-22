import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function StravaCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const hasExchanged = useRef(false) // Evitar múltiples llamadas

  useEffect(() => {
    // Si ya se intercambió el código, no hacer nada
    if (hasExchanged.current) return
    
    const code = searchParams.get('code')
    
    if (!code) {
      setError('No se recibió código de autorización')
      return
    }

    const exchangeToken = async () => {
      // Marcar que ya estamos procesando
      hasExchanged.current = true
      
      try {
        // El redirect_uri debe ser el mismo que se usó para obtener el código
        const redirectUri = `${window.location.origin}/callback`
        
        console.log('Intercambiando código:', code)
        
        // Llamar al backend para intercambiar el código por tokens
        const response = await axios.get(`http://localhost:3000/api/strava/callback?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`)
        
        console.log('Respuesta del backend:', response.data)
        
        if (response.data && response.data.user) {
          const userData = response.data.user
          
          // Parsear el nombre si viene como un solo campo
          let firstname = userData.firstname || 'Usuario'
          let lastname = userData.lastname || 'Strava'
          
          if (userData.name && !userData.firstname) {
            const nameParts = userData.name.split(' ')
            firstname = nameParts[0] || 'Usuario'
            lastname = nameParts.slice(1).join(' ') || 'Strava'
          }
          
          // Guardar usuario autenticado
          login({
            id: userData.id || userData._id,
            stravaId: userData.stravaId,
            firstname: firstname,
            lastname: lastname,
            profile: userData.profile || userData.profile_medium || userData.profile_photo || 'https://via.placeholder.com/150'
          })
          
          // Redirigir a actividades
          navigate('/activities')
        } else {
          setError('Error al procesar la autenticación')
        }
      } catch (err) {
        console.error('Error en callback de Strava:', err)
        setError(err.response?.data?.error || 'Error al conectar con Strava')
      }
    }

    exchangeToken()
  }, [searchParams, login, navigate])

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</span>
        <h2 style={{ color: '#c33', marginBottom: '1rem' }}>Error de Autenticación</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '1rem 2rem',
            background: '#fc5200',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Volver al Login
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>
        🚴
      </div>
      <h2 style={{ color: '#242428', marginBottom: '0.5rem' }}>Conectando con Strava...</h2>
      <p style={{ color: '#666' }}>Por favor espera un momento</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default StravaCallback
