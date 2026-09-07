import { useState, useEffect } from 'react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: 'admin@ghss.edu',
    password: '',
  })
  const [logs, setLogs] = useState([])
  const [toast, setToast] = useState(null)

  // Log API response helper
  const addLog = (endpoint, method, status, payload) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [
      { id: Date.now(), timestamp, endpoint, method, status, payload },
      ...prev,
    ])
  }

  // Show floating toast alert
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Check active session on initial load
  const checkAuth = async () => {
    setCheckingAuth(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data)
        addLog('/api/auth/me', 'GET', res.status, data)
      } else {
        setUser(null)
        if (res.status !== 401) {
          const errData = await res.json().catch(() => ({}))
          addLog('/api/auth/me', 'GET', res.status, errData)
        }
      }
    } catch (err) {
      addLog('/api/auth/me', 'GET', 500, { error: err.message })
    } finally {
      setCheckingAuth(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // Handle Login Submit
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      showToast('error', 'Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      addLog('/api/auth/login', 'POST', res.status, data)

      if (res.ok) {
        setUser(data)
        showToast('success', `Welcome back, ${data.name || 'Admin'}!`)
      } else {
        showToast('error', data.message || 'Invalid email or password.')
      }
    } catch (err) {
      showToast('error', 'Failed to connect to authentication server.')
      addLog('/api/auth/login', 'POST', 500, { error: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await res.json()
      addLog('/api/auth/logout', 'POST', res.status, data)

      setUser(null)
      setFormData(prev => ({ ...prev, password: '' }))
      showToast('success', 'Logged out successfully. Cookies cleared.')
    } catch (err) {
      showToast('error', 'Logout request failed.')
    } finally {
      setLoading(false)
    }
  }

  // Test Protected Endpoint
  const handleTestProtected = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await res.json()
      addLog('/api/auth/me', 'GET', res.status, data)

      if (res.ok) {
        showToast('success', 'Protected route verified! Token signature valid.')
      } else {
        showToast('error', `Rejected (${res.status}): ${data.message || 'Unauthorized'}`)
      }
    } catch (err) {
      showToast('error', 'Request failed.')
    }
  }

  // Test Token Refresh Endpoint
  const handleTestRefresh = async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await res.json()
      addLog('/api/auth/refresh', 'POST', res.status, data)

      if (res.ok) {
        showToast('success', 'Tokens rotated successfully!')
      } else {
        showToast('error', `Refresh failed (${res.status}): ${data.message || 'Unauthorized'}`)
      }
    } catch (err) {
      showToast('error', 'Refresh request failed.')
    }
  }

  return (
    <div className="auth-app-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Form / Profile Card */}
      <div className="glass-card">
        <div className="brand-header">
          <div className="brand-icon">🛡️</div>
          <div>
            <h1 className="brand-title">GHSS Portal</h1>
            <p className="brand-subtitle">Centralized Authentication & Admin Access</p>
          </div>
        </div>

        {checkingAuth ? (
          <div style={{ padding: '40px 0', textCenter: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Verifying active session...</span>
          </div>
        ) : user ? (
          <div className="user-profile-card">
            <div className="profile-header">
              <div className="avatar-badge">{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
              <div className="profile-details">
                <h3>{user.name || 'Administrator'}</h3>
                <p>{user.email}</p>
                <div>
                  <span className="badge-tag badge-admin">ADMIN</span>{' '}
                  <span className="badge-tag badge-active">ACTIVE SESSION</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-secondary" onClick={handleTestProtected}>
                🔒 Test Protected Route (/api/auth/me)
              </button>
              <button className="btn-secondary" onClick={handleTestRefresh}>
                🔄 Test Token Refresh (/api/auth/refresh)
              </button>
              <button className="btn-primary btn-danger" onClick={handleLogout} disabled={loading}>
                {loading ? <div className="spinner"></div> : '🚪 Log Out'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@ghss.edu"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Password</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Sign In to Portal →'}
            </button>

            <div className="quick-fill-bar">
              <div className="quick-fill-info">
                <strong>Demo Credentials:</strong> admin@ghss.edu
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setFormData({ email: 'admin@ghss.edu', password: 'Password@123' })}
              >
                Auto-fill
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Diagnostics Console Card */}
      <div className="glass-card console-card">
        <div className="console-header">
          <span className="console-title">
            <span>📡</span> Live Auth API Console
          </span>
          {logs.length > 0 && (
            <button
              className="btn-secondary"
              style={{ padding: '2px 8px', fontSize: '11px' }}
              onClick={() => setLogs([])}
            >
              Clear
            </button>
          )}
        </div>

        <div className="console-window">
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', paddingTop: '60px' }}>
              No API requests sent yet.
              <br />
              Submit login credentials or test session routes to inspect real-time responses.
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="log-entry">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>
                    <strong>{log.method}</strong> {log.endpoint}
                  </span>
                  <span className={`log-status-${log.status}`}>{log.status} OK</span>
                </div>
                <span className="log-time">{log.timestamp}</span>
                <pre style={{ marginTop: '4px', overflowX: 'auto' }}>
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
