import './About.css'

function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <div className="about-header">
          <h1>About IACP</h1>
          <div className="about-logo">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#667eea"/>
              <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="#667eea"/>
            </svg>
          </div>
        </div>

        <div className="about-section">
          <h2>What is IACP?</h2>
          <p>
            <strong>IACP</strong> stands for <strong>Identity, Auth, Claim, Provider</strong> - a custom authentication 
            and authorization service provider that acts as a centralized identity management system.
          </p>
        </div>

        <div className="about-section">
          <h3>Identity</h3>
          <p>Who the user is - manages user identification, profiles, and account information.</p>
        </div>

        <div className="about-section">
          <h3>Auth</h3>
          <p>Authentication and Authorization - handles secure login, token validation, and access control.</p>
        </div>

        <div className="about-section">
          <h3>Claim</h3>
          <p>What attributes and permissions are issued - configurable JWT token claims (username, email, userId, etc.).</p>
        </div>

        <div className="about-section">
          <h3>Provider</h3>
          <p>Source of truth - the centralized database and token issuer that applications can trust.</p>
        </div>

        <div className="about-section">
          <h2>Key Features</h2>
          <ul className="features-list">
            <li>🔐 User registration and authentication</li>
            <li>🎫 JWT token generation with configurable claims</li>
            <li>⚙️ Runtime claim configuration</li>
            <li>🔒 Secure password hashing with bcrypt</li>
            <li>📊 User and application management</li>
            <li>🎭 Role-based access control</li>
            <li>🔗 Webhook support for login/logout events</li>
            <li>📚 Interactive API documentation</li>
            <li>✅ Request/Response schema validation</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <strong>Frontend:</strong> React 18+, TypeScript, Vite
            </div>
            <div className="tech-item">
              <strong>Backend:</strong> Node.js, Fastify, TypeScript
            </div>
            <div className="tech-item">
              <strong>Database:</strong> PostgreSQL 16, Drizzle ORM
            </div>
            <div className="tech-item">
              <strong>DevOps:</strong> Docker, Docker Compose
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Webhook System</h2>
          <p>
            IACP supports webhooks that automatically trigger on login and logout events. 
            This allows external applications to receive real-time notifications when users authenticate.
          </p>
          <ul className="features-list">
            <li>✅ Automatic webhook triggering on login/logout</li>
            <li>✅ Support for global and app-specific webhooks</li>
            <li>✅ HMAC SHA256 signature support</li>
            <li>✅ Event logging and audit trail</li>
            <li>✅ Source detection (internal vs external)</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>API Documentation</h2>
          <p>
            Visit <a href="/docs" target="_blank" rel="noopener noreferrer">/docs</a> for interactive 
            Swagger/OpenAPI documentation of all available endpoints.
          </p>
        </div>

        <div className="about-footer">
          <p className="version">Version 1.0.0</p>
          <p className="copyright">© 2024 IACP - Identity, Auth, Claim, Provider</p>
        </div>
      </div>
    </div>
  )
}

export default About

