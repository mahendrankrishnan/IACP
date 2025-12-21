import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import type { ClaimConfig } from '../types'
import './Config.css'

function Config() {
  const [config, setConfig] = useState<ClaimConfig>({
    includeUsername: true,
    includePhoneNumber: true,
    includeEmail: true,
    includeUserId: true,
    tokenExpiry: '24h'
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/config/claims', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: ClaimConfig = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/config/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()

      if (response.ok && data.config) {
        setMessage('Configuration updated successfully! Note: New tokens will use this configuration.')
        setConfig(data.config)
      } else {
        setError(data.error || 'Failed to update configuration')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="config-container">
      <div className="config-card">
        <h1>Claim Configuration</h1>
        <p className="config-subtitle">
          Configure which claims are included in JWT tokens
        </p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="config-section">
            <h2>Token Claims</h2>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includeUsername"
                  checked={config.includeUsername}
                  onChange={handleChange}
                />
                <span>Include Username</span>
              </label>
              <p className="checkbox-description">
                Include the username in the JWT token payload
              </p>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includePhoneNumber"
                  checked={config.includePhoneNumber}
                  onChange={handleChange}
                />
                <span>Include Phone Number</span>
              </label>
              <p className="checkbox-description">
                Include the phone number in the JWT token payload
              </p>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includeEmail"
                  checked={config.includeEmail}
                  onChange={handleChange}
                />
                <span>Include Email</span>
              </label>
              <p className="checkbox-description">
                Include the email address in the JWT token payload
              </p>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includeUserId"
                  checked={config.includeUserId}
                  onChange={handleChange}
                />
                <span>Include User ID (sub claim)</span>
              </label>
              <p className="checkbox-description">
                Include the user ID as the 'sub' (subject) claim in the JWT token
              </p>
            </div>
          </div>

          <div className="config-section">
            <h2>Token Expiry</h2>
            <div className="form-group">
              <label htmlFor="tokenExpiry">Token Expiration Time</label>
              <select
                id="tokenExpiry"
                name="tokenExpiry"
                value={config.tokenExpiry}
                onChange={handleChange}
                className="select-input"
              >
                <option value="15m">15 minutes</option>
                <option value="1h">1 hour</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </select>
              <p className="input-description">
                How long the JWT token will be valid before expiring
              </p>
            </div>
          </div>

          <button type="submit" className="config-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>

        <div className="config-info">
          <h3>Current Configuration</h3>
          <pre className="config-json">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default Config

