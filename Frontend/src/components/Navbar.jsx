import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🏃‍♂️ Strava Activities
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Inicio</Link>
          </li>
          {isAuthenticated() && (
            <>
              <li className="nav-item">
                <Link to="/activities" className="nav-link">Actividades</Link>
              </li>
              <li className="nav-item">
                <Link to="/analyzed" className="nav-link">📊 Analizadas</Link>
              </li>
            </>
          )}
        </ul>
        
        {isAuthenticated() ? (
          <div className="nav-user">
            <div className="user-info">
              <img 
                src={user?.profile || 'https://via.placeholder.com/40'} 
                alt={`${user?.firstname} ${user?.lastname}`}
                className="user-avatar"
              />
              <span className="user-name">{user?.firstname} {user?.lastname}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
