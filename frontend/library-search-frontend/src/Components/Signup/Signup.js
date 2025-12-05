import React, { useState } from 'react';
import './Signup.css';
import { signup } from '../../Services/authService';

function Signup({ onClose, onLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Email validation helper
  const isEmailValid = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Required fields validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain uppercase, lowercase, number, and special character.');
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Terms agreement validation
    if (!agree) {
      setError('You must agree to the terms to create an account.');
      return;
    }

    setIsLoading(true);

    try {
      const signupData = { firstName, lastName, email, password };
      const response = await signup(signupData);

      if (response.success) {
        // Auto-login after successful signup
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

        if (onClose) onClose();
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-overlay" onClick={onClose}>
      <div className="signup-card" onClick={(e) => e.stopPropagation()}>
        <h2>Create an Account</h2>
        <form className="signup-form" onSubmit={handleSubmit} autoComplete="off">
          {/* hidden decoy fields to reduce browser autofill */}
          <input type="text" name="prevent_autofill" style={{ display: 'none' }} />
          <input type="password" name="prevent_autofill_pwd" style={{ display: 'none' }} />
          {error && <div className="signup-error">{error}</div>}

          <div className="name-row">
            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <input name="given-name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required />
            </div>
            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input name="family-name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="Enter your email"
              className={emailTouched ? (isEmailValid(email) ? 'valid' : 'invalid') : ''}
              required
            />
            {emailTouched && email && (
              <div className={`validation-message ${isEmailValid(email) ? 'valid' : 'invalid'}`}>
                {isEmailValid(email) ? '✓ Valid email format' : '✗ Invalid email format'}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <input name="new-password" autoComplete="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
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
            <label>Confirm Password <span className="required">*</span></label>
            <input name="confirm-password" autoComplete="new-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required />
          </div>

          <label className="terms">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
            <span>I agree to the Terms of Service and Privacy Policy <span className="required">*</span></span>
          </label>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          </div>

          <div className="alt-action">
            <span>Already have an account?</span>
            <button type="button" className="link-btn" onClick={onClose}>Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
