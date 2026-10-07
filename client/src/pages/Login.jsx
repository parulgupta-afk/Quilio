import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Auth11 from '../components/watermelon-ui/auth-11';

export default function Login() {
  const { login, logout, user, isAuthenticated, isLoading, error, clearError } = useAuthStore();
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

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* Active Session Notification */}
      {isAuthenticated && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#111318]/90 backdrop-blur-md border border-indigo-500/30 px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm text-neutral-200">
          <span>
            Signed in as <strong className="text-indigo-300">{user?.name || user?.email}</strong>
          </span>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors"
          >
            Go to Feed →
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="text-neutral-400 hover:text-rose-300 text-xs cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Watermelon Auth-11 Authentication Component */}
      <Auth11
        mode="login"
        onSwitchMode={() => {
          clearError?.();
          navigate('/register');
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        errorMessage={localError || error}
        brandTitle="Move fast. Feel Free"
        heroImage="https://assets.watermelon.sh/auth-11.avif"
        activeDot={0}
      />
    </div>
  );
}
