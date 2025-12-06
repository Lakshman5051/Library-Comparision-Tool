import React, { useState, useRef, useEffect } from 'react';
import './Login.css';
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton';
import { loginWithGoogle, login } from '../../Services/authService';
import { verifyLoginOTP, resendLoginOTP } from '../../Services/loginOTPService';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import ResetPassword from '../ResetPassword/ResetPassword';

function Login({ onLogin, onSignup, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 2FA OTP states
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(true);
  const otpInputRefs = useRef([]);

  // Resend timer effect
  useEffect(() => {
    let timer;
    if (resendDisabled && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, resendTimer]);

  // Focus first OTP input when OTP step is shown
  useEffect(() => {
    if (showOTPInput && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [showOTPInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

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
        // Password verified - show OTP input
        setShowOTPInput(true);
        setResendTimer(60);
        setResendDisabled(true);
        setSuccessMessage('OTP sent to your email. Please check your inbox.');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    const paste = e.clipboardData.getData('text');
    if (!/^\d{6}$/.test(paste)) {
      e.preventDefault();
      return;
    }
    const newOtp = paste.split('');
    setOtp(newOtp);
    otpInputRefs.current[5]?.focus();
  };

  const handleVerifyOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        setError('Please enter a 6-digit OTP.');
        setIsLoading(false);
        return;
      }

      const response = await verifyLoginOTP(email, otpCode);

      if (response.success) {
        // Login successful - pass user data to parent
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
        setError(response.message || 'OTP verification failed.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResendDisabled(true);
    setResendTimer(60);

    try {
      await resendLoginOTP(email);
      setSuccessMessage('OTP has been resent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
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

  // Handle Forgot Password Success
  const handleForgotPasswordSuccess = (token, emailAddress) => {
    setResetToken(token);
    setResetEmail(emailAddress);
    setShowForgotPassword(false);
    setShowResetPassword(true);
  };

  // Handle Reset Password Success
  const handleResetPasswordSuccess = () => {
    setShowResetPassword(false);
    setSuccessMessage('Password reset successful! You can now login with your new password.');
    setEmail(resetEmail);
    setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
  };

  return (
    <div className="login-container">
      {onBack && (
        <button className="back-to-home-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>
      )}

      <div className="login-content">
        <h1 className="welcome-heading">Welcome Back</h1>
        <p className="welcome-subtitle">Sign in to your account to continue exploring and comparing libraries.</p>

        <div className="login-card">
          <h2 className="card-heading">Sign in to IntelliLib</h2>

          <form onSubmit={handleSubmit}>
            {successMessage && (
              <div className="success-message">
                <span>✓</span> {successMessage}
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email or Username <span className="required">*</span></label>
              <input
                id="email"
                type="text"
                className="login-input"
                placeholder="Enter your email or username"
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
              <div className="password-label-row">
                <label htmlFor="password">Password <span className="required">*</span></label>
                <button
                  type="button"
                  className="forgot-password-link-btn"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input password-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="remember-me-row">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            {!showOTPInput && (
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Sign in'}
              </button>
            )}
          </form>

          {/* OTP Input Section */}
          {showOTPInput && (
            <div className="otp-section">
              <h3 className="otp-heading">Enter Verification Code</h3>
              <p className="otp-subtitle">We've sent a 6-digit code to <strong>{email}</strong></p>
              
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={handleOTPPaste}
                    onFocus={(e) => e.target.select()}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    disabled={isLoading}
                    className="otp-input"
                  />
                ))}
              </div>

              {error && (
                <div className="error-message">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button 
                type="button" 
                className="login-btn" 
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="resend-section">
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || isLoading}
                >
                  {resendDisabled ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                </button>
              </div>

              <button
                type="button"
                className="back-to-password-btn"
                onClick={() => {
                  setShowOTPInput(false);
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                  setSuccessMessage('');
                }}
              >
                ← Back to password
              </button>
            </div>
          )}

          {!showOTPInput && (
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          )}

          <div className="signup-link">
            <p>Don't have an account? <button className="signup-link-btn" onClick={onSignup}>Sign Up</button></p>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
        />
      )}

      {showResetPassword && (
        <ResetPassword
          token={resetToken}
          onClose={() => setShowResetPassword(false)}
          onSuccess={handleResetPasswordSuccess}
        />
      )}
    </div>
  );
}

export default Login;