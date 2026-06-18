import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🏃‍♂️ Strava Activities
        </Link>

        {/* Hamburguesa */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Menú */}
        <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Inicio</Link>
          </li>
          {isAuthenticated() && (
            <>
              <li className="nav-item">
                <Link to="/activities" className="nav-link" onClick={() => setMenuOpen(false)}>Actividades</Link>
              </li>
              <li className="nav-item">
                <Link to="/analyzed" className="nav-link" onClick={() => setMenuOpen(false)}>📊 Analizadas</Link>
              </li>
              <li className="nav-item">
                <Link to="/performance" className="nav-link" onClick={() => setMenuOpen(false)}>🎯 Análisis</Link>
              </li>
            </>
          )}
          {isAuthenticated() ? (
            <li className="nav-item nav-user-mobile">
              <img src={user?.profile || 'https://via.placeholder.com/40'} alt="" className="user-avatar" />
              <span className="user-name">{user?.firstname}</span>
              <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
            </li>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>Iniciar Sesión</Link>
            </li>
          )}
        </ul>

        {/* Usuario desktop */}
        {isAuthenticated() && (
          <div className="nav-user nav-user-desktop">
            <div className="user-info">
              <img src={user?.profile || 'https://via.placeholder.com/40'} alt="" className="user-avatar" />
              <span className="user-name">{user?.firstname} {user?.lastname}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar