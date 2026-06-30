import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" fill="#FC5200"/>
          </svg>
          <span>CycleAnalytics</span>
        </Link>

        {/* Hamburguesa */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menú */}
        <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Inicio
            </Link>
          </li>
          {isAuthenticated() && (
            <>
              <li className="nav-item">
                <Link to="/activities" className={`nav-link ${isActive('/activities') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  Actividades
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/analyzed" className={`nav-link ${isActive('/analyzed') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  Analizadas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/performance" className={`nav-link ${isActive('/performance') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  Análisis
                </Link>
              </li>
            </>
          )}
          {isAuthenticated() ? (
            <li className="nav-item nav-user-mobile">
              <img src={user?.profile || ''} alt="" className="user-avatar" />
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
              <img src={user?.profile || ''} alt="" className="user-avatar" />
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