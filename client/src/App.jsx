import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

const BootSplash = lazy(() => import('./pages/BootSplash'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const HomeFeed = lazy(() => import('./pages/HomeFeed'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Search = lazy(() => import('./pages/Search'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LearnThis = lazy(() => import('./pages/LearnThis'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Progress = lazy(() => import('./pages/Progress'));

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#050505',
        color: '#a78bfa',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
      }}
    >
      Loading Quilio…
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
}

function S({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<S><BootSplash /></S>} />
      <Route path="/login" element={<S><PublicRoute><Login /></PublicRoute></S>} />
      <Route path="/register" element={<S><PublicRoute><Register /></PublicRoute></S>} />
      <Route path="/welcome" element={<S><Welcome /></S>} />

      <Route path="/home" element={<S><ProtectedRoute><HomeFeed /></ProtectedRoute></S>} />
      <Route path="/post/:slug" element={<S><ProtectedRoute><PostDetail /></ProtectedRoute></S>} />
      <Route path="/profile/:id" element={<S><ProtectedRoute><Profile /></ProtectedRoute></S>} />
      <Route path="/search" element={<S><ProtectedRoute><Search /></ProtectedRoute></S>} />
      <Route path="/write" element={<S><ProtectedRoute><CreatePost /></ProtectedRoute></S>} />
      <Route path="/dashboard" element={<S><ProtectedRoute><Dashboard /></ProtectedRoute></S>} />
      <Route path="/learn/:postId" element={<S><ProtectedRoute><LearnThis /></ProtectedRoute></S>} />
      <Route path="/notifications" element={<S><ProtectedRoute><Notifications /></ProtectedRoute></S>} />
      <Route path="/progress" element={<S><ProtectedRoute><Progress /></ProtectedRoute></S>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
