import React, { useState, useEffect, useRef } from 'react'
import type { User, UserListResponse, UserApplicationsAndRolesResponse } from '../types'
import './UserSearch.css'

function UserSearch() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [userData, setUserData] = useState<UserApplicationsAndRolesResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      fetchUserApplicationsAndRoles(selectedUserId)
    } else {
      setUserData(null)
    }
  }, [selectedUserId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoadingUsers(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: UserListResponse = await response.json()
        setUsers(data.users)
        setError('')
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('Error loading users')
      console.error('Error fetching users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchUserApplicationsAndRoles = async (userId: number): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}/applications-roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: UserApplicationsAndRolesResponse = await response.json()
        setUserData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch user applications and roles')
        setUserData(null)
      }
    } catch (err) {
      setError('Error fetching user applications and roles')
      console.error('Error fetching user data:', err)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.id.toString().includes(searchLower)
    )
  })

  const selectedUser = users.find(u => u.id === selectedUserId)

  const handleUserSelect = (user: User): void => {
    setSelectedUserId(user.id)
    setSearchTerm(`${user.username} (${user.email})`)
    setShowDropdown(false)
  }

  const handleClear = (): void => {
    setSelectedUserId(null)
    setSearchTerm('')
    setUserData(null)
    setShowDropdown(false)
  }

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="user-search-container">
      <div className="user-search-card">
        <div className="user-search-header">
          <h1>User Search</h1>
          <p className="search-subtitle">Search and view applications and roles for a specific user</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-section">
          <div className="search-input-wrapper" ref={searchWrapperRef}>
            <label htmlFor="user-search">Search User</label>
            <div className="search-input-container">
              <input
                type="text"
                id="user-search"
                className="search-input"
                placeholder="Type to search by username, email, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                  if (!e.target.value) {
                    setSelectedUserId(null)
                    setUserData(null)
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
              />
              {selectedUserId && (
                <button
                  className="clear-button"
                  onClick={handleClear}
                  title="Clear selection"
                >
                  ✕
                </button>
              )}
            </div>

            {showDropdown && searchTerm && filteredUsers.length > 0 && (
              <div className="dropdown-menu">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`dropdown-item ${selectedUserId === user.id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="dropdown-item-content">
                      <span className="dropdown-username">{user.username}</span>
                      <span className="dropdown-email">{user.email}</span>
                    </div>
                    <span className="dropdown-id">ID: {user.id}</span>
                  </div>
                ))}
              </div>
            )}

            {showDropdown && searchTerm && filteredUsers.length === 0 && (
              <div className="dropdown-menu">
                <div className="dropdown-item no-results">No users found</div>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading">Loading user applications and roles...</div>
        )}

        {userData && !loading && (
          <div className="results-section">
            <div className="user-info-header">
              <h2>User Information</h2>
              <div className="user-info">
                <span className="user-info-label">User ID:</span>
                <span className="user-info-value">{userData.userId}</span>
                {selectedUser && (
                  <>
                    <span className="user-info-label">Username:</span>
                    <span className="user-info-value">{selectedUser.username}</span>
                    <span className="user-info-label">Email:</span>
                    <span className="user-info-value">{selectedUser.email}</span>
                  </>
                )}
              </div>
            </div>

            <div className="applications-section">
              <h2>
                Applications & Roles ({userData.applications.length})
              </h2>

              {userData.applications.length === 0 ? (
                <div className="no-applications">
                  <p>This user is not assigned to any applications.</p>
                </div>
              ) : (
                <div className="applications-list">
                  {userData.applications.map((app) => (
                    <div key={app.id} className="application-card">
                      <div className="application-header">
                        <h3>{app.appName}</h3>
                        <span className="application-id">ID: {app.id}</span>
                      </div>
                      <div className="application-dates">
                        <span>Created: {formatDate(app.createdAt)}</span>
                        <span>Updated: {formatDate(app.updatedAt)}</span>
                      </div>
                      
                      <div className="roles-section">
                        <h4>Roles ({app.roles.length})</h4>
                        {app.roles.length === 0 ? (
                          <p className="no-roles">No roles assigned to this application</p>
                        ) : (
                          <div className="roles-list">
                            {app.roles.map((role) => (
                              <div key={role.id} className="role-badge">
                                <span className="role-name">{role.roleName}</span>
                                <span className="role-id">ID: {role.id}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedUserId && !loading && (
          <div className="empty-state">
            <p>Select a user from the search above to view their applications and roles</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSearch

