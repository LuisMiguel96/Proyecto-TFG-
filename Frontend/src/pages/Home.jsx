import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Home.css'

function Home() {
  const { isAuthenticated } = useAuth()

  // Imagen de ciclismo local
  // La imagen debe estar en: public/assets/cycling-hero.jpg
  const cyclingImage = '/assets/cycling-hero.jpg'

  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="hero-title">Sistema de Análisis de Actividades Deportivas</h1>
        <div className="hero-description">
          <p>
            Sincroniza, almacena y analiza tus actividades deportivas con visualizaciones 
            interactivas y dashboards personalizados.
          </p>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-image-card">
          <img 
            src={cyclingImage}
            alt="Análisis de actividades de ciclismo"
            className="feature-showcase-image"
          />
          <div className="image-overlay">
            <h2>Visualiza tus Entrenamientos</h2>
            {isAuthenticated() ? (
              <Link to="/activities" className="image-cta-button">
                Ver Mis Actividades →
              </Link>
            ) : (
              <Link to="/login" className="image-cta-button">
                Comenzar Ahora →
              </Link>
            )}
          </div>
        </div>

        <h2>Características del Sistema</h2>
        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Sincronización con Strava</h3>
            <p>Conexión OAuth 2.0 con Strava API para importar automáticamente tus actividades deportivas</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Análisis Visual Interactivo</h3>
            <p>Gráficos dinámicos con mapas de rutas, perfiles de elevación y métricas en tiempo real</p>
          </div>

          

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>API REST Backend</h3>
            <p>Capa de servicios personalizada para procesar y analizar datos sin límites externos</p>
          </div>
        </div>
      </div>

      <div className="info-footer">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>📚 Quiénes Somos</h3>
            <p>
              Plataforma dedicada al análisis del rendimiento deportivo mediante el uso de 
              Inteligencia Artificial. Sincronizamos tus actividades de Strava para ofrecer 
              visualizaciones avanzadas, estadísticas detalladas y análisis predictivo de tu 
              desempeño atlético.
            </p>
            <p>
              Combinamos tecnologías web modernas con IA para transformar datos de 
              entrenamiento en insights accionables que impulsen tu progreso deportivo.
            </p>
           
          </div>

          <div className="footer-section">
            <h3>📞 Contacto</h3>
            <div className="contact-info">
              <p>
                <span className="contact-icon">👤</span>
                <strong>Estudiante:</strong> Luis Miguel Barreiro
              </p>
              <p>
                <span className="contact-icon">🎓</span>
                <strong>Centro:</strong> [UCLM]
              </p>
              <p>
                <span className="contact-icon">📧</span>
                <strong>Email:</strong> user1@gmail.com
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
