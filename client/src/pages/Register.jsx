import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AuthShell from '../components/auth/AuthShell';

export default function Register() {
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async ({ name, email, password, confirmPassword }) => {
    setLocalError('');
    clearError?.();

    if (!name || name.trim().length < 2) {
      setLocalError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const result = await register(name.trim(), email.trim(), password);
    if (result?.success) navigate('/home');
  };

  return (
    <AuthShell
      mode="register"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      errorMessage={localError || error || ''}
    />
  );
}
