import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Config from './components/Config'
import Users from './components/Users'
import Roles from './components/Roles'
import Applications from './components/Applications'
import AppRoles from './components/AppRoles'
import UserSearch from './components/UserSearch'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import type { User } from './types'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserInfo(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserInfo = async (token: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      localStorage.removeItem('token')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (token: string, userData: User): void => {
    localStorage.setItem('token', token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = (): void => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <div className="app-content">
          {isAuthenticated && <Sidebar />}
          <main className={`app-main ${isAuthenticated ? 'with-sidebar' : ''}`}>
            <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Register onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                  <Dashboard user={user!} /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/config" 
              element={
                isAuthenticated ? 
                  <Config /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/users" 
              element={
                isAuthenticated ? 
                  <Users /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/roles" 
              element={
                isAuthenticated ? 
                  <Roles /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/applications" 
              element={
                isAuthenticated ? 
                  <Applications /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/app-roles" 
              element={
                isAuthenticated ? 
                  <AppRoles /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/user-search" 
              element={
                isAuthenticated ? 
                  <UserSearch /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App

