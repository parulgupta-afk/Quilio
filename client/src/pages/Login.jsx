import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Auth11 from '../components/watermelon-ui/auth-11';

export default function Login() {
  const { login, googleLogin, logout, user, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async ({ email, password }) => {
    setLocalError('');
    clearError?.();

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const result = await login(email.trim(), password);
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
        mode="login"
        onSwitchMode={() => {
          clearError?.();
          navigate('/register');
        }}
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
        errorMessage={localError || error}
        brandTitle="Move fast. Feel Free"
        heroImage="https://assets.watermelon.sh/auth-11.avif"
        activeDot={0}
        sessionUser={user}
        isAuthenticated={isAuthenticated}
        onLogout={() => logout()}
        onNavigateFeed={() => navigate('/home')}
      />
    </div>
  );
}
