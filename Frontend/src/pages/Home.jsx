import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Home.css'

function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home">

      {/* HERO */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Powered by Machine Learning</div>
          <h1 className="hero-title">
            Análisis de Rendimiento<br />
            <span className="hero-accent">Ciclista con IA</span>
          </h1>
          <p className="hero-description">
            Conecta tus actividades de Strava y obtén análisis predictivo de tu rendimiento
            mediante modelos RNN, LSTM y BiLSTM entrenados con datos de ciclistas profesionales.
          </p>
          <div className="hero-actions">
            {isAuthenticated() ? (
              <Link to="/activities" className="btn-primary">Ver mis actividades →</Link>
            ) : (
              <Link to="/login" className="btn-primary">Conectar con Strava →</Link>
            )}
            <Link to="/analyzed" className="btn-secondary">Ver análisis</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">3</span>
              <span className="hero-stat-label">Niveles de referencia profesional</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">Registros</span>
              <span className="hero-stat-label">Ciclistas profesionales</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">¿Dónde estás tú?</span>
              <span className="hero-stat-label">Descúbrelo ahora</span>
            </div>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img src="/assets/cycling-hero.jpg" alt="Ciclismo" className="hero-image" />
          <div className="hero-image-overlay" />
        </div>
      </div>

      {/* CARACTERÍSTICAS */}
      <div className="features-section">
        <div className="section-label">Funcionalidades</div>
        <h2 className="section-title">Todo lo que necesitas para mejorar</h2>
        <div className="features-grid">
          {[
            {
              icon: '⚡',
              title: 'Predicción de potencia óptima',
              desc: 'Modelos RNN, LSTM y BiLSTM predicen tu potencia óptima segundo a segundo comparada con ciclistas profesionales.'
            },
            {
              icon: '🗺️',
              title: 'Segmentación de rutas',
              desc: 'Segmentación automática por tipo de terreno — subidas, llanos y bajadas — con análisis individualizado de cada tramo.'
            },
            {
              icon: '🔄',
              title: 'Sincronización con Strava',
              desc: 'Conexión OAuth 2.0 con Strava para importar automáticamente tus actividades y streams de datos.'
            },
            {
              icon: '🧠',
              title: 'Análisis cognitivo con IA',
              desc: 'GPT-OSS 120B interpreta tus datos y genera recomendaciones personalizadas para mejorar tu rendimiento.'
            },
            {
              icon: '📊',
              title: 'Visualización interactiva',
              desc: 'Gráficos de potencia, cadencia, fuerza, fatiga acumulada y comparativa entre los 3 modelos de referencia.'
            },
            {
              icon: '📱',
              title: 'Diseño responsive',
              desc: 'Consulta tus análisis desde cualquier dispositivo — móvil, tablet o escritorio.'
            },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODELOS ML */}
      <div className="models-section">
        <div className="models-inner">
          <div className="section-label light">Modelos de Machine Learning</div>
          <h2 className="section-title light">Tres niveles de referencia profesional</h2>
          <div className="models-grid">
            {[
              { modelo: 'RNN', color: '#ef4444', nivel: 'Umbral mínimo', desc: 'Establece el nivel mínimo de rendimiento esperado para un ciclista profesional. Si lo superas, tu rendimiento es adecuado.', dato1: '~19.7W', label1: 'Precisión de predicción', dato2: '777K', label2: 'Registros de entrenamiento' },
              { modelo: 'LSTM', color: '#f59e0b', nivel: 'Nivel estándar', desc: 'Representa el rendimiento estándar en condiciones normales de entrenamiento profesional.', dato1: '~21.5W', label1: 'Precisión de predicción', dato2: '93', label2: 'Actividades profesionales' },
              { modelo: 'BiLSTM', color: '#22c55e', nivel: 'Techo máximo', desc: 'Establece el techo máximo de rendimiento basado en los mejores patrones de ciclistas de élite.', dato1: '~21.8W', label1: 'Precisión de predicción', dato2: '60s', label2: 'Ventana de análisis' }, ,
            ].map((m, i) => (
              <div className="model-card" key={i} style={{ borderTop: `3px solid ${m.color}` }}>
                <div className="model-header">
                  <span className="model-name" style={{ color: m.color }}>{m.modelo}</span>
                  <span className="model-nivel">{m.nivel}</span>
                </div>
                <p className="model-desc">{m.desc}</p>
                <div className="model-metrics">
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="info-footer">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>CycleAnalytics</h3>
            <p>
              Plataforma de análisis de rendimiento ciclista mediante Machine Learning.
              Desarrollada como Trabajo de Fin de Grado, combina modelos RNN, LSTM y BiLSTM
              entrenados con datos reales de ciclistas profesionales para ofrecer análisis
              predictivo personalizado.
            </p>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <div className="contact-info">
              <p><strong>Autor:</strong> Luis Miguel Barreiro</p>
              <p><strong>Centro:</strong> UCLM</p>
              <p><strong>Email:</strong> user1@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CycleAnalytics · TFG</span>
        </div>
      </div>

    </div>
  )
}

export default Home