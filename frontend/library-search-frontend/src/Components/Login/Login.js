import React, { useState } from 'react';
import './Login.css';
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton';
import { loginWithGoogle } from '../../Services/authService';

function Login({ onLogin, onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle Google Login Success
  const handleGoogleSuccess = async (idToken) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await loginWithGoogle(idToken);

      if (response.success) {
        // Pass user data to parent component
        onLogin({
          userId: response.userId,
          username: response.username || response.email,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          profilePictureUrl: response.profilePictureUrl,
          role: response.role,
          authProvider: response.authProvider,
          isNewUser: response.isNewUser
        });
      } else {
        setError(response.message || 'Google login failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login Error
  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Library Comparator</h1>
        <p className="subtitle">Please login to continue</p>

        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <div className="divider">
          <span>OR</span>
        </div>

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

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="signup-link">
          <p>Don't have an account?</p>
          <button className="signup-btn" onClick={onSignup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;