function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Temporary navbar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600">
            Quilio
          </h1>
          <nav className="flex gap-6 text-sm font-medium text-gray-600">
            <a href="/" className="hover:text-indigo-600">Home</a>
            <a href="/explore" className="hover:text-indigo-600">Explore</a>
            <a href="/login" className="hover:text-indigo-600">Login</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">
            A blog isn’t just something you read
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            It’s something you learn from, verify, remix, and grow from.
          </p>
          <div className="inline-flex gap-4">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
              Get Started
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
              Explore Posts
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        Quilio — AI-Powered Social Learning Platform
      </footer>
    </div>
  )
}

export default App
