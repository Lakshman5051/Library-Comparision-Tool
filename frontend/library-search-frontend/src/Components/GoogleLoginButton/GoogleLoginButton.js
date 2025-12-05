import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './GoogleLoginButton.css';

function GoogleLoginButton({ onSuccess, onError }) {

  const handleSuccess = (credentialResponse) => {
    // credentialResponse contains the Google ID token
    const idToken = credentialResponse.credential;

    if (onSuccess) {
      onSuccess(idToken);
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');

    if (onError) {
      onError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}

export default GoogleLoginButton;
