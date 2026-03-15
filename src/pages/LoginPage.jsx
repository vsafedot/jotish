import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Already logged in → redirect
  if (user) {
    navigate('/list', { replace: true })
    return null
  }

  const handleChange = (e) => {
    setError('')
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // simulated async delay for cool UX feel haha
    await new Promise(r => setTimeout(r, 600))
    const result = login(form.username, form.password)
    if (result.success) {
      navigate('/list', { replace: true })
    } else {
      console.warn('Login failed for user:', form.username)
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card glass animate-fadeInUp" role="main">
        <div className="login-card__header">
          <div className="login-logo">
            <span className="login-logo__icon">⬡</span>
          </div>
          <h1 className="login-card__title">Employee Insights</h1>
          <p className="login-card__subtitle">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="username"
                name="username"
                type="text"
                className="input input--icon"
                placeholder="testuser"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className="input input--icon"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-toggle-pass"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" role="alert" id="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6, flexShrink: 0 }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            id="login-submit-btn"
            disabled={loading || !form.username || !form.password}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">
          <span>Demo credentials: &nbsp;</span>
          <code>testuser</code> / <code>Test123</code>
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--bg-surface);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px 32px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }
        .login-card__header { text-align: center; margin-bottom: 32px; }
        .login-logo {
          width: 48px; height: 48px;
          background: var(--brand);
          color: #fff;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .login-logo__icon { font-size: 24px; }
        .login-card__title { font-size: 1.5rem; font-weight: 600; color: var(--brand); letter-spacing: -0.02em; }
        .login-card__subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .input-wrap { position: relative; }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          display: flex;
          pointer-events: none;
        }
        .input--icon { padding-left: 36px; }
        .input-toggle-pass {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          transition: color var(--transition);
        }
        .input-toggle-pass:hover { color: var(--text-primary); }
        .login-hint {
          margin-top: 24px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .login-hint code {
          background: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-primary);
          font-family: monospace;
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  )
}
