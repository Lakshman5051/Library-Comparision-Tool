import React, { useState } from 'react';
import './Login.css';
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton';
import { loginWithGoogle, login } from '../../Services/authService';

function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const loginData = { email, password };
      const response = await login(loginData);

      if (response.success) {
        // Pass user data to parent component
        onLogin({
          userId: response.userId,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          profilePictureUrl: response.profilePictureUrl,
          role: response.role,
          authProvider: response.authProvider
        });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password <span className="required">*</span></label>
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
              required
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