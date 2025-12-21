import React, { useState, useEffect } from 'react'
import type { User, JWTPayload } from '../types'
import './Dashboard.css'

interface DashboardProps {
  user: User
}

function Dashboard({ user }: DashboardProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [decodedToken, setDecodedToken] = useState<JWTPayload | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (token) {
      decodeToken()
    }
  }, [token])

  const decodeToken = async (): Promise<void> => {
    if (!token) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()
      if (response.ok && data.decoded) {
        setDecodedToken(data.decoded)
      }
    } catch (error) {
      console.error('Error decoding token:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome to Dashboard</h1>
        <p className="dashboard-subtitle">Your authentication information</p>

        <div className="info-section">
          <h2>User Information</h2>
          <div className="info-item">
            <span className="info-label">ID:</span>
            <span className="info-value">{user?.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{user?.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Phone:</span>
            <span className="info-value">{user?.phone}</span>
          </div>
        </div>

        <div className="info-section">
          <h2>JWT Token</h2>
          <div className="token-container">
            <div className="token-display">
              {token ? (
                <code className="token-text">{token}</code>
              ) : (
                <span className="no-token">No token available</span>
              )}
            </div>
            {token && (
              <button 
                onClick={() => copyToClipboard(token)} 
                className="copy-button"
              >
                Copy Token
              </button>
            )}
          </div>
        </div>

        {decodedToken && (
          <div className="info-section">
            <h2>Token Claims (Decoded)</h2>
            <div className="claims-container">
              <pre className="claims-json">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {loading && <div className="loading">Decoding token...</div>}
      </div>
    </div>
  )
}

export default Dashboard

