import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Auth11 from '../components/auth/Auth11';

export default function Login() {
  const { login, isLoading, error, clearError } = useAuthStore();
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
  };

  return (
    <Auth11
      mode="login"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      errorMessage={localError || error || ''}
    />
  );
}
