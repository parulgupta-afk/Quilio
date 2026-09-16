import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Search from './pages/Search';
import LearnThis from './pages/LearnThis';
import Notifications from './pages/Notifications';
import Progress from './pages/Progress';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-indigo-600">
            Quilio
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/search" className="hover:text-indigo-600">Search</Link>

            {isAuthenticated ? (
              <>
                <Link to="/write" className="hover:text-indigo-600">Write</Link>
                <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                <Link to="/progress" className="hover:text-indigo-600">Progress</Link>
                <Link to="/notifications" className="hover:text-indigo-600">Notifications</Link>
                <Link to={`/profile/${user?._id}`} className="hover:text-indigo-600">
                  {user?.name}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="hover:text-indigo-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-600">Login</Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/search" element={<Search />} />

          <Route path="/write" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/learn/:postId" element={<ProtectedRoute><LearnThis /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500 bg-white">
        Quilio — AI-Powered Social Learning Platform
      </footer>
    </div>
  );
}

export default App;
