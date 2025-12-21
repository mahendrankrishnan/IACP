import React, { useState, useEffect } from 'react'
import type { Application, ApplicationListResponse, Role, RoleListResponse, AppRole, AppRoleListResponse } from '../types'
import './AppRoles.css'

function AppRoles() {
  const [applications, setApplications] = useState<Application[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [appRoles, setAppRoles] = useState<AppRole[]>([])
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedAppId) {
      fetchAppRoles(selectedAppId)
    }
  }, [selectedAppId])

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const [appsRes, rolesRes] = await Promise.all([
        fetch('/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/roles', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (appsRes.ok && rolesRes.ok) {
        const appsData: ApplicationListResponse = await appsRes.json()
        const rolesData: RoleListResponse = await rolesRes.json()
        setApplications(appsData.applications)
        setRoles(rolesData.roles)
        if (appsData.applications.length > 0) {
          setSelectedAppId(appsData.applications[0].id)
        }
        setError('')
      } else {
        setError('Failed to fetch data')
      }
    } catch (err) {
      setError('Error loading data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppRoles = async (appId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/applications/${appId}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: AppRoleListResponse = await response.json()
        setAppRoles(data.appRoles)
        setError('')
      } else {
        setError('Failed to fetch app roles')
      }
    } catch (err) {
      setError('Error loading app roles')
      console.error('Error fetching app roles:', err)
    }
  }

  const handleAssignRole = async (): Promise<void> => {
    if (!selectedAppId || !selectedRoleId) {
      setError('Please select both application and role')
      return
    }

    // Check if role is already assigned
    const alreadyAssigned = appRoles.some(ar => ar.roleId === selectedRoleId)
    if (alreadyAssigned) {
      setError('This role is already assigned to the application')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/applications/${selectedAppId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleId: selectedRoleId })
      })

      if (response.ok) {
        setSelectedRoleId(null)
        fetchAppRoles(selectedAppId)
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to assign role')
      }
    } catch (err) {
      setError('Error assigning role')
      console.error('Error assigning role:', err)
    }
  }

  const handleRemoveRole = async (appId: number, roleId: number): Promise<void> => {
    if (!confirm('Are you sure you want to remove this role from the application?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/applications/${appId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchAppRoles(selectedAppId!)
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to remove role')
      }
    } catch (err) {
      setError('Error removing role')
      console.error('Error removing role:', err)
    }
  }

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const getAvailableRoles = (): Role[] => {
    const assignedRoleIds = appRoles.map(ar => ar.roleId)
    return roles.filter(role => !assignedRoleIds.includes(role.id))
  }

  const selectedApp = applications.find(app => app.id === selectedAppId)

  return (
    <div className="app-roles-container">
      <div className="app-roles-card">
        <div className="app-roles-header">
          <h1>Application Role Assignments</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="app-selector">
              <label htmlFor="application">Select Application:</label>
              <select
                id="application"
                value={selectedAppId || ''}
                onChange={(e) => setSelectedAppId(Number(e.target.value))}
                className="app-select"
              >
                <option value="">-- Select Application --</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.appName}
                  </option>
                ))}
              </select>
            </div>

            {selectedAppId && (
              <>
                <div className="assignment-section">
                  <h2>Assign Role to {selectedApp?.appName}</h2>
                  <div className="assignment-form">
                    <select
                      value={selectedRoleId || ''}
                      onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                      className="role-select"
                    >
                      <option value="">-- Select Role --</option>
                      {getAvailableRoles().map(role => (
                        <option key={role.id} value={role.id}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignRole}
                      className="assign-button"
                      disabled={!selectedRoleId || getAvailableRoles().length === 0}
                    >
                      Assign Role
                    </button>
                  </div>
                  {getAvailableRoles().length === 0 && roles.length > 0 && (
                    <p className="info-message">All available roles are already assigned to this application.</p>
                  )}
                </div>

                <div className="assigned-roles-section">
                  <h2>Assigned Roles</h2>
                  {appRoles.length === 0 ? (
                    <div className="no-roles">
                      <p>No roles assigned to this application yet.</p>
                    </div>
                  ) : (
                    <div className="app-roles-table-container">
                      <table className="app-roles-table">
                        <thead>
                          <tr>
                            <th>Role Name</th>
                            <th>Assigned At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appRoles.map((appRole) => (
                            <tr key={appRole.id}>
                              <td>{appRole.roleName}</td>
                              <td>{formatDate(appRole.createdAt)}</td>
                              <td>
                                <button
                                  className="remove-button"
                                  onClick={() => handleRemoveRole(appRole.appId, appRole.roleId)}
                                  title="Remove role"
                                >
                                  🗑️ Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {!selectedAppId && applications.length === 0 && (
              <div className="no-applications">
                <p>No applications found. Please create an application first.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AppRoles

