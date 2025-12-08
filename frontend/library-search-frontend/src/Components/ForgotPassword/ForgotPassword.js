import React, { useState, useRef, useEffect } from 'react';
import './ForgotPassword.css';

function ForgotPassword({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success === 'true' || data.success === true) {
        // OTP sent - show OTP input
        setShowOTPInput(true);
        setResendTimer(60);
        setResendDisabled(true);
        setSuccessMessage('Verification code sent to your email. Please check your inbox.');
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to process request. Please try again.');
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
        setError('Please enter a 6-digit verification code.');
        setIsLoading(false);
        return;
      }

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/auth/verify-password-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otpCode }),
      });

      // Get response text first (can only be called once)
      const responseText = await response.text();
      
      // Check response status
      if (!response.ok) {
        // Try to parse error message
        let errorMessage = `Verification failed (${response.status}). Please try again.`;
        if (responseText && responseText.trim().length > 0) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseErr) {
            // If not JSON, use the text as error message
            errorMessage = responseText || errorMessage;
          }
        }
        setError(errorMessage);
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      // Parse successful response
      if (!responseText || responseText.trim().length === 0) {
        setError('Empty response from server. Please try again.');
        setIsLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', responseText);
        setError('Invalid response from server. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.success === 'true' || data.success === true) {
        // OTP verified - call success callback with token
        if (data.token) {
          onSuccess(data.token, email);
        } else {
          setError('Token not received from server. Please try again.');
          setIsLoading(false);
        }
      } else {
        setError(data.message || 'Invalid verification code.');
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResendDisabled(true);
    setResendTimer(60);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/auth/resend-password-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success === 'true' || data.success === true) {
        setSuccessMessage('Verification code has been resent to your email.');
      } else {
        setError(data.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    }
  };

  return (
    <div className="forgot-password-overlay" onClick={onClose}>
      <div className="forgot-password-card" onClick={(e) => e.stopPropagation()}>
        <h2>Reset Your Password</h2>
        <p className="description">
          {showOTPInput 
            ? `Enter the verification code sent to ${email}`
            : "Enter your email address and we'll send you a verification code to reset your password."}
        </p>

        {!showOTPInput ? (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                <span>✓</span> {successMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address <span className="required">*</span></label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoFocus
                required
                disabled={isLoading}
              />
            </div>

            <div className="actions">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="otp-section">
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                <span>✓</span> {successMessage}
              </div>
            )}

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

            <div className="actions">
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  setShowOTPInput(false);
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={isLoading}
              >
                Back
              </button>
            </div>

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
          </div>
        )}

        <div className="back-to-login">
          <button type="button" className="link-btn" onClick={onClose}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;