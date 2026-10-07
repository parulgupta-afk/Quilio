import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Auth11 from '../components/watermelon-ui/auth-11';

export default function Register() {
  const { register, googleLogin, logout, user, isAuthenticated, isLoading, error, clearError } = useAuthStore();
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
    if (result?.success) {
      navigate('/home');
    }
  };

  const handleGoogleLogin = async (credentialOrPayload) => {
    setLocalError('');
    clearError?.();
    const result = await googleLogin(credentialOrPayload);
    if (result?.success) {
      navigate('/home');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* Watermelon Auth-11 Authentication Component */}
      <Auth11
        mode="register"
        onSwitchMode={() => {
          clearError?.();
          navigate('/login');
        }}
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
        errorMessage={localError || error}
        brandTitle="Move fast. Feel Free"
        heroImage="https://assets.watermelon.sh/auth-11.avif"
        activeDot={1}
        sessionUser={user}
        isAuthenticated={isAuthenticated}
        onLogout={() => logout()}
        onNavigateFeed={() => navigate('/home')}
      />
    </div>
  );
}
