import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/user-search', label: 'User Search', icon: '🔍' },
    { path: '/roles', label: 'Roles', icon: '🎭' },
    { path: '/applications', label: 'Applications', icon: '📱' },
    { path: '/app-roles', label: 'App Roles', icon: '🔐' },
    { path: '/config', label: 'Config', icon: '⚙️' },
  ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{link.icon}</span>
                <span className="sidebar-label">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

