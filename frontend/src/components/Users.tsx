import { useState, useEffect } from 'react'
import AddUser from './AddUser'
import EditUser from './EditUser'
import type { User, UserListResponse } from '../types'
import './Users.css'

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  const handleUserAdded = (): void => {
    setShowAddForm(false)
    fetchUsers()
  }

  const handleUserUpdated = (): void => {
    setEditingUser(null)
    fetchUsers()
  }

  const handleEditClick = (user: User): void => {
    setEditingUser(user)
    setShowAddForm(false)
  }

  const handleDeleteClick = async (user: User): Promise<void> => {
    if (!confirm(`Are you sure you want to delete user "${user.username}" (${user.email})? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchUsers()
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('Error deleting user')
      console.error('Error deleting user:', err)
    }
  }

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="users-container">
      <div className="users-card">
        <div className="users-header">
          <h1>IACP - Users</h1>
          <button 
            className="add-user-button"
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingUser(null)
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New User'}
          </button>
        </div>

        {showAddForm && (
          <AddUser onUserAdded={handleUserAdded} onCancel={() => setShowAddForm(false)} />
        )}

        {editingUser && (
          <EditUser 
            user={editingUser} 
            onUserUpdated={handleUserUpdated} 
            onCancel={() => setEditingUser(null)} 
          />
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <div className="users-stats">
              <span>Total Users: {users.length}</span>
            </div>

            {users.length === 0 ? (
              <div className="no-users">
                <p>No users found. Add your first user!</p>
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDate(user.updatedAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEditClick(user)}
                              title="Edit user"
                            >
                              ✏️ 
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteClick(user)}
                              title="Delete user"
                            >
                              🗑️ 
                            </button>
                          </div>
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

export default Users

