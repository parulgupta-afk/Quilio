import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Auth11 from '../components/auth/Auth11';
import api from '../services/api';

export default function Login() {
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');
  const [busy, setBusy] = useState(false);

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
    setBusy(true);
    try {
      // Dedicated endpoint creates/resets aria@quilio.app and returns JWT
      const { data } = await api.post('/auth/demo-login');
      useAuthStore.setState({
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
        },
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      navigate('/home');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (!error.response
          ? 'Cannot reach API. Start the server (port 5000).'
          : 'Demo login failed. Check MongoDB and server logs.');
      setLocalError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Auth11
      mode="login"
      onSubmit={handleSubmit}
      onGoogleCredential={handleGoogle}
      onDemoLogin={handleDemo}
      isLoading={isLoading || busy}
      errorMessage={localError || error || ''}
    />
  );
}
