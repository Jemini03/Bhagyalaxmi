import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please verify credentials.');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to log in. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="login-card-container">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="login-brand-header">
            <div className="brand-logo-mark">
              <span className="logo-letter">B</span>
            </div>
            <div>
              <span className="eyebrow-accent">BHAGYALAXMI RMC</span>
              <h1>Plant Dispatch Portal</h1>
            </div>
          </div>

          <p className="login-subtext">
            Authorized access for plant managers, dispatchers & laboratory quality controllers.
          </p>

          {error && (
            <div className="admin-login-error" role="alert">
              <strong>Access Denied:</strong> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              placeholder="e.g. admin"
            />
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="admin-password">Password</label>
              <button
                type="button"
                className="btn-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide 🙈' : 'Show 👁️'}
              </button>
            </div>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
            />
          </div>

          
          <button
            type="submit"
            className="btn-login-submit"
            disabled={submitting}
          >
            {submitting ? 'Verifying Access...' : 'Sign In to Plant Portal →'}
          </button>

          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate('/')}
          >
            ← Return to Public Website
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLogin;
