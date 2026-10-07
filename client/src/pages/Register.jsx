import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Auth11 from '../components/watermelon-ui/auth-11';

export default function Register() {
  const { register, logout, user, isAuthenticated, isLoading, error, clearError } = useAuthStore();
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
        mode="register"
        onSwitchMode={() => {
          clearError?.();
          navigate('/login');
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        errorMessage={localError || error}
        brandTitle="Move fast. Feel Free"
        heroImage="https://assets.watermelon.sh/auth-11.avif"
        activeDot={1}
      />
    </div>
  );
}
