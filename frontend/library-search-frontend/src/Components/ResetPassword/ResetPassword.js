import React, { useState, useEffect } from 'react';
import './ResetPassword.css';

function ResetPassword({ token, onClose, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        const response = await fetch(
          `${API_URL}/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();
        setIsTokenValid(data.valid);

        if (!data.valid) {
          setError('This reset link is invalid or has expired. Please request a new one.');
        }
      } catch (err) {
        setError('Failed to validate reset link. Please try again.');
        setIsTokenValid(false);
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    // Password strength validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return;
    }

    // Password match validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success === 'true') {
        onSuccess();
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="reset-password-overlay">
        <div className="reset-password-card">
          <div className="loading-spinner">Validating reset link...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-overlay" onClick={onClose}>
      <div className="reset-password-card" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Password</h2>
        <p className="description">
          {isTokenValid
            ? 'Enter your new password below.'
            : 'This reset link is no longer valid.'}
        </p>

        {isTokenValid ? (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="newPassword">New Password <span className="required">*</span></label>
              <input
                id="newPassword"
                type="password"
                className="input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                autoFocus
                required
              />
            </div>

            <div className="password-requirements">
              <p className="requirements-title">Password must contain:</p>
              <ul>
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (!@#$%^&*...)</li>
              </ul>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                required
              />
            </div>

            <div className="actions">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="actions">
            <button type="button" className="btn-primary" onClick={onClose}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;