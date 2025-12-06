const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


export const verifyLoginOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    return data;
  } catch (error) {
    console.error('Verify login OTP error:', error);
    throw error;
  }
};


export const resendLoginOTP = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/resend-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }

    return data;
  } catch (error) {
    console.error('Resend login OTP error:', error);
    throw error;
  }
};

