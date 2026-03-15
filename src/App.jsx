import React from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ListPage from './pages/ListPage'
import DetailsPage from './pages/DetailsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { useAuth } from './context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <span className="navbar__logo">⬡ Employee Insights</span>
      <div className="navbar__nav">
        <NavLink to="/list"      className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Directory</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Analytics</NavLink>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ marginLeft: 8 }}>
          Sign out
        </button>
      </div>
    </nav>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/list" element={
          <ProtectedRoute><ListPage /></ProtectedRoute>
        } />

        <Route path="/details/:id" element={
          <ProtectedRoute><DetailsPage /></ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/list" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
