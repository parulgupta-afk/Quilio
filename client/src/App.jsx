import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';

function Home() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <h2 className="text-4xl font-bold mb-4">
        A blog isn’t just something you read
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        It’s something you learn from, verify, remix, and grow from.
      </p>

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            Welcome back, <span className="font-semibold">{user?.name}</span> 👋
          </p>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="inline-flex gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-indigo-600">
            Quilio
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <span className="text-gray-800">{user?.name}</span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="hover:text-indigo-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-600">
                  Login
                </Link>
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

      {/* Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        Quilio — AI-Powered Social Learning Platform
      </footer>
    </div>
  );
}

export default App;
