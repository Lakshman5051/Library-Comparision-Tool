import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  // Predefined credentials for demo
  const validCredentials = {
    admin: {
      password: 'admin123',
      role: 'admin'
    },
    Lakshman: {
      password: 'Lakshman123',
      role: 'user'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    // Check credentials
    const userCreds = validCredentials[username];
    
    if (!userCreds) {
      setError('Invalid username or password');
      return;
    }

    if (userCreds.password !== password) {
      setError('Invalid username or password');
      return;
    }

    // Successful login - use the role from credentials
    onLogin({ 
      username, 
      role: userCreds.role 
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Library Comparator</h1>
        <p className="subtitle">Please login to continue</p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="login-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="signup-link">
          <p>Don't have an account?</p>
          <button className="signup-btn" onClick={onSignup}>
            Sign Up
          </button>
        </div>

        {/*<div className="demo-credentials">
          <p className="demo-title">Demo Credentials:</p>
          <div className="credentials-table">
            <div className="credential-row">
              <span className="label">Admin:</span>
              <span className="value">username: <strong>admin</strong> | password: <strong>admin123</strong></span>
            </div>
            <div className="credential-row">
              <span className="label">User:</span>
              <span className="value">username: <strong>Lakshman</strong> | password: <strong>Lakshman123</strong></span>
            </div>
          </div> 
        </div>*/}
      </div>
    </div>
  );
}

export default Login;