import React, { useState, useEffect } from 'react'
import type { Application, ApplicationListResponse, User, UserListResponse, UserApplication, UserApplicationListResponse } from '../types'
import './Applications.css'

function Applications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [appName, setAppName] = useState<string>('')
  const [selectedApp, setSelectedApp] = useState<number | null>(null)
  const [userAssignments, setUserAssignments] = useState<Map<number, UserApplication[]>>(new Map())
  const [showAssignForm, setShowAssignForm] = useState<boolean>(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchApplications()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedApp !== null) {
      fetchUserAssignments(selectedApp)
    }
  }, [selectedApp])

  const fetchApplications = async (): Promise<void> => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: ApplicationListResponse = await response.json()
        setApplications(data.applications)
        setError('')
      } else {
        setError('Failed to fetch applications')
      }
    } catch (err) {
      setError('Error loading applications')
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: UserListResponse = await response.json()
        setUsers(data.users)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const fetchUserAssignments = async (appId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/applications/${appId}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: UserApplicationListResponse = await response.json()
        setUserAssignments(prev => {
          const newMap = new Map(prev)
          newMap.set(appId, data.userApplications)
          return newMap
        })
      }
    } catch (err) {
      console.error('Error fetching user assignments:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!appName.trim()) {
      setError('Application name is required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appName: appName.trim() })
      })

      if (response.ok) {
        setAppName('')
        setShowAddForm(false)
        fetchApplications()
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create application')
      }
    } catch (err) {
      setError('Error creating application')
      console.error('Error creating application:', err)
    }
  }

  const handleCancel = (): void => {
    setShowAddForm(false)
    setAppName('')
    setError('')
  }

  const handleAssignUser = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedApp || !selectedUserId) {
      setError('Please select a user')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/applications/${selectedApp}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: selectedUserId })
      })

      if (response.ok) {
        setShowAssignForm(false)
        setSelectedUserId(null)
        if (selectedApp !== null) {
          fetchUserAssignments(selectedApp)
        }
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to assign user to application')
      }
    } catch (err) {
      setError('Error assigning user to application')
      console.error('Error assigning user:', err)
    }
  }

  const handleRemoveUser = async (appId: number, userId: number): Promise<void> => {
    if (!confirm('Are you sure you want to remove this user from the application?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/applications/${appId}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchUserAssignments(appId)
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to remove user from application')
      }
    } catch (err) {
      setError('Error removing user from application')
      console.error('Error removing user:', err)
    }
  }

  const handleManageUsers = (appId: number): void => {
    setSelectedApp(appId)
    setShowAssignForm(true)
    fetchUserAssignments(appId)
  }

  const getAssignedUsers = (appId: number): UserApplication[] => {
    return userAssignments.get(appId) || []
  }

  const getAvailableUsers = (appId: number): User[] => {
    const assigned = getAssignedUsers(appId)
    const assignedUserIds = new Set(assigned.map(ua => ua.userId))
    return users.filter(user => !assignedUserIds.has(user.id))
  }

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="applications-container">
      <div className="applications-card">
        <div className="applications-header">
          <h1>Application Management</h1>
          <button 
            className="add-app-button"
            onClick={() => {
              setShowAddForm(!showAddForm)
              setAppName('')
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Application'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="app-form">
            <div className="form-group">
              <label htmlFor="appName">Application Name</label>
              <input
                type="text"
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Enter application name"
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Create Application
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading applications...</div>
        ) : (
          <>
            <div className="applications-stats">
              <span>Total Applications: {applications.length}</span>
            </div>

            {applications.length === 0 ? (
              <div className="no-applications">
                <p>No applications found. Add your first application!</p>
              </div>
            ) : (
              <>
                <div className="applications-table-container">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Application Name</th>
                        <th>Assigned Users</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => {
                        const assignedUsers = getAssignedUsers(app.id)
                        return (
                          <tr key={app.id}>
                            <td>{app.id}</td>
                            <td>{app.appName}</td>
                            <td>{assignedUsers.length}</td>
                            <td>{formatDate(app.createdAt)}</td>
                            <td>{formatDate(app.updatedAt)}</td>
                            <td>
                              <button
                                className="manage-users-button"
                                onClick={() => handleManageUsers(app.id)}
                                title="Manage users"
                              >
                                👥 Manage Users
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {showAssignForm && selectedApp !== null && (
                  <div className="user-assignment-panel">
                    <div className="panel-header">
                      <h2>Manage Users for Application: {applications.find(a => a.id === selectedApp)?.appName}</h2>
                      <button
                        className="close-button"
                        onClick={() => {
                          setShowAssignForm(false)
                          setSelectedApp(null)
                          setSelectedUserId(null)
                        }}
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="assigned-users-section">
                      <h3>Assigned Users ({getAssignedUsers(selectedApp).length})</h3>
                      {getAssignedUsers(selectedApp).length === 0 ? (
                        <p className="no-assignments">No users assigned to this application</p>
                      ) : (
                        <div className="assigned-users-list">
                          {getAssignedUsers(selectedApp).map((ua) => (
                            <div key={ua.id} className="assigned-user-item">
                              <span>{ua.username} ({ua.email})</span>
                              <button
                                className="remove-button"
                                onClick={() => handleRemoveUser(selectedApp, ua.userId)}
                                title="Remove user"
                              >
                                ✕ Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="assign-user-section">
                      <h3>Assign New User</h3>
                      {getAvailableUsers(selectedApp).length === 0 ? (
                        <p className="no-available-users">All users are already assigned to this application</p>
                      ) : (
                        <form onSubmit={handleAssignUser} className="assign-user-form">
                          <div className="form-group">
                            <label htmlFor="userId">Select User</label>
                            <select
                              id="userId"
                              value={selectedUserId || ''}
                              onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                              required
                            >
                              <option value="">-- Select a user --</option>
                              {getAvailableUsers(selectedApp).map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.username} ({user.email})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="submit-button">
                              Assign User
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Applications

