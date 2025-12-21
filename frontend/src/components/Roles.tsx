import React, { useState, useEffect } from 'react'
import type { Role, RoleListResponse } from '../types'
import './Roles.css'

function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState<string>('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async (): Promise<void> => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: RoleListResponse = await response.json()
        setRoles(data.roles)
        setError('')
      } else {
        setError('Failed to fetch roles')
      }
    } catch (err) {
      setError('Error loading roles')
      console.error('Error fetching roles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!roleName.trim()) {
      setError('Role name is required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleName: roleName.trim() })
      })

      if (response.ok) {
        setRoleName('')
        setShowAddForm(false)
        setEditingRole(null)
        fetchRoles()
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save role')
      }
    } catch (err) {
      setError('Error saving role')
      console.error('Error saving role:', err)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this role?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchRoles()
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete role')
      }
    } catch (err) {
      setError('Error deleting role')
      console.error('Error deleting role:', err)
    }
  }

  const handleEditClick = (role: Role): void => {
    setEditingRole(role)
    setRoleName(role.roleName)
    setShowAddForm(true)
  }

  const handleCancel = (): void => {
    setShowAddForm(false)
    setEditingRole(null)
    setRoleName('')
    setError('')
  }

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="roles-container">
      <div className="roles-card">
        <div className="roles-header">
          <h1>Role Management</h1>
          <button 
            className="add-role-button"
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingRole(null)
              setRoleName('')
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Role'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="role-form">
            <div className="form-group">
              <label htmlFor="roleName">Role Name</label>
              <input
                type="text"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name"
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading roles...</div>
        ) : (
          <>
            <div className="roles-stats">
              <span>Total Roles: {roles.length}</span>
            </div>

            {roles.length === 0 ? (
              <div className="no-roles">
                <p>No roles found. Add your first role!</p>
              </div>
            ) : (
              <div className="roles-table-container">
                <table className="roles-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Role Name</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.roleName}</td>
                        <td>{formatDate(role.createdAt)}</td>
                        <td>{formatDate(role.updatedAt)}</td>
                        <td>
                          <button
                            className="edit-button"
                            onClick={() => handleEditClick(role)}
                            title="Edit role"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(role.id)}
                            title="Delete role"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Roles

