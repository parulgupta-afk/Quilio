import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Auth11 from '../components/auth/Auth11';

export default function Login() {
  const { login, googleLogin, register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async ({ email, password }) => {
    setLocalError('');
    clearError?.();
    if (!email?.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    const result = await login(email.trim(), password);
    if (result?.success) navigate('/home');
    else setLocalError(result?.message || error || 'Login failed');
  };

  const handleGoogle = useCallback(
    async (credential) => {
      setLocalError('');
      clearError?.();
      const result = await googleLogin(credential);
      if (result?.success) navigate('/home');
      else setLocalError(result?.message || 'Google sign-in failed');
    },
    [googleLogin, clearError, navigate]
  );

  const handleDemo = async () => {
    setLocalError('');
    clearError?.();
    // Try login first
    let result = await login('aria@quilio.app', 'demo1234');
    if (result?.success) {
      navigate('/home');
      return;
    }
    // Create demo user if missing, then login
    result = await register('Aria Chen', 'aria@quilio.app', 'demo1234');
    if (result?.success) {
      navigate('/home');
      return;
    }
    // If exists but bad hash — try register message
    setLocalError(
      result?.message ||
        'Demo login failed. Run: cd server && npm run seed  then use aria@quilio.app / demo1234'
    );
  };

  return (
    <Auth11
      mode="login"
      onSubmit={handleSubmit}
      onGoogleCredential={handleGoogle}
      onDemoLogin={handleDemo}
      isLoading={isLoading}
      errorMessage={localError || error || ''}
    />
  );
}
