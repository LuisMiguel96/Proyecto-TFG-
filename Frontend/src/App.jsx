import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import StravaCallback from './pages/StravaCallback'
import Activities from './pages/Activities'
import ActivityDetail from './pages/ActivityDetail'
import AnalyzedActivities from './pages/AnalyzedActivities'
import PerformanceAnalysis from './pages/PerformanceAnalysis'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.VITE_PUBLIC_URL}>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<StravaCallback />} />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <Activities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyzed"
              element={
                <ProtectedRoute>
                  <AnalyzedActivities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity/:id"
              element={
                <ProtectedRoute>
                  <ActivityDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <PerformanceAnalysis />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
