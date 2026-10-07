import { useState } from 'react';
import { motion } from 'framer-motion';

// Custom Google SVG Icon
export const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Custom Apple SVG Icon
export const AppleIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    {...props}
  >
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
  </svg>
);

export default function Auth11({
  mode = 'login',
  onSwitchMode,
  onSubmit,
  isLoading = false,
  errorMessage = '',
  brandTitle = 'Move fast. Feel Free',
  heroImage = 'https://assets.watermelon.sh/auth-11.avif',
  activeDot = 0,
  sessionUser = null,
  isAuthenticated = false,
  onLogout,
  onNavigateFeed,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [socialNotice, setSocialNotice] = useState('');

  const isRegister = mode === 'register';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ name, email, password, confirmPassword, mode, rememberMe });
    }
  };

  const handleFillDemo = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  const handleSocialClick = (provider) => {
    setSocialNotice(`${provider} sign-in will be enabled with your OAuth credentials.`);
    setTimeout(() => setSocialNotice(''), 4000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#050505] font-sans text-neutral-200 antialiased selection:bg-white/20 selection:text-white lg:flex-row">
      {/* Left Image Panel */}
      <div className="relative hidden w-full flex-col justify-end p-6 lg:flex lg:min-h-screen lg:w-1/2">
        {/* Background Image Wrapper */}
        <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
          <img
            src={heroImage}
            alt="Serene landscape with a lone tree"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

          {/* Bottom Content within the image */}
          <div className="absolute right-0 bottom-0 left-0 z-10 flex w-full flex-col items-center justify-center pb-14 text-center px-8">
            <h1 className="text-3xl font-medium tracking-tight text-balance text-white md:text-4xl lg:text-5xl drop-shadow-md">
              {brandTitle}
            </h1>
            <p className="mt-3 text-sm text-neutral-300 max-w-md text-balance opacity-90">
              Grounded RAG · Deep Learning Gateway · Sovereign Synthesis
            </p>

            {/* Pagination Indicators */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className={`h-1.5 rounded-full transition-all ${activeDot === 0 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
              <div className={`h-1.5 rounded-full transition-all ${activeDot === 1 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
              <div className={`h-1.5 rounded-full transition-all ${activeDot === 2 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
              <div className={`h-1.5 rounded-full transition-all ${activeDot === 3 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center py-10 px-6 sm:px-12 lg:w-1/2 min-h-screen">
        <motion.div
          key={mode}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[440px]"
        >
          {/* Active Session Card (Spaced line-by-line) */}
          {isAuthenticated && (
            <motion.div
              variants={itemVariants}
              className="mb-8 p-5 rounded-2xl bg-[#0f1118] border border-indigo-500/30 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Active Session
                </span>
              </div>
              
              <div className="text-sm text-neutral-200 mb-4 leading-relaxed">
                Currently signed in as:
                <div className="text-white font-medium text-base mt-0.5 break-all">
                  {sessionUser?.name ? `${sessionUser.name} (${sessionUser.email})` : sessionUser?.email}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                <button
                  type="button"
                  onClick={onNavigateFeed}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Go to Feed →
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-neutral-300 hover:text-rose-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}

          {/* Titles & Subtitle */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            {isRegister ? (
              <h2 className="text-3xl sm:text-4xl leading-tight font-medium tracking-tight text-balance text-white">
                Create your own
                <br />
                knowledge base{' '}
                <span className="font-serif font-light italic text-[#c0c1ff]">faster.</span>
              </h2>
            ) : (
              <h2 className="text-3xl sm:text-4xl leading-tight font-medium tracking-tight text-balance text-white">
                Create your own AI
                <br />
                workforce{' '}
                <span className="font-serif font-light italic text-[#c0c1ff]">faster.</span>
              </h2>
            )}
            <p className="mt-3 text-sm text-neutral-400">
              {isRegister
                ? 'Join Quilio · Grounded RAG & Sovereign Synthesis'
                : 'Welcome back · Sovereign Knowledge Engine'}
            </p>
          </motion.div>

          {/* Social Sign-in Buttons */}
          <motion.div
            variants={itemVariants}
            className="mb-6 grid grid-cols-2 gap-3.5"
          >
            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-[#141414] py-3 px-3 text-[13px] font-medium text-white transition-all hover:bg-[#1f1f1f] hover:border-white/20 active:scale-[0.97] cursor-pointer"
            >
              <GoogleIcon className="text-[17px] shrink-0" />
              <span className="truncate">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialClick('Apple')}
              className="flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-[#141414] py-3 px-3 text-[13px] font-medium text-white transition-all hover:bg-[#1f1f1f] hover:border-white/20 active:scale-[0.97] cursor-pointer"
            >
              <AppleIcon className="text-[17px] shrink-0" />
              <span className="truncate">Apple</span>
            </button>
          </motion.div>

          {socialNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 text-center text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-xl p-3"
            >
              {socialNotice}
            </motion.div>
          )}

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="relative mb-8 flex items-center"
          >
            <div className="grow border-t border-white/10"></div>
            <span className="px-4 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
              Or continue with email
            </span>
            <div className="grow border-t border-white/10"></div>
          </motion.div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs text-center leading-relaxed"
              role="alert"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Main Form — Generous Line-by-Line Spacing */}
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            {isRegister && (
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label
                  htmlFor="auth-name"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                >
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-[#0A0A0A] px-4 py-3.5 text-sm text-white transition-colors placeholder:text-neutral-500 focus:border-indigo-400 focus:bg-[#111] focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </motion.div>
            )}

            {/* Email Field Line */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label
                htmlFor="auth-email"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
              >
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[14px] border border-white/10 bg-[#0A0A0A] px-4 py-3.5 text-sm text-white transition-colors placeholder:text-neutral-500 focus:border-indigo-400 focus:bg-[#111] focus:ring-1 focus:ring-indigo-400 focus:outline-none"
              />
            </motion.div>

            {/* Password Field Line */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                >
                  Password
                </label>
                {isRegister ? (
                  <span className="text-[11px] text-neutral-400">Min. 6 characters</span>
                ) : (
                  <span className="text-[11px] text-indigo-300 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-[#0A0A0A] px-4 py-3.5 pr-14 text-sm text-white transition-colors placeholder:text-neutral-500 focus:border-indigo-400 focus:bg-[#111] focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer bg-transparent border-0"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password (Registration only) */}
            {isRegister && (
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label
                  htmlFor="auth-confirm-password"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                >
                  Confirm password
                </label>
                <input
                  id="auth-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-[#0A0A0A] px-4 py-3.5 text-sm text-white transition-colors placeholder:text-neutral-500 focus:border-indigo-400 focus:bg-[#111] focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </motion.div>
            )}

            {/* Options Line: Remember Me */}
            {!isRegister && (
              <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-400 hover:text-neutral-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-[#0A0A0A] text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span>Remember this device</span>
                </label>
                <span className="text-[11px] text-neutral-500">TLS Encrypted</span>
              </motion.div>
            )}

            {/* Submit Button Line */}
            <motion.div variants={itemVariants} className="mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#EAEAEA] py-3.5 px-6 text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.06)] transition-all hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.18)] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading
                  ? isRegister
                    ? 'Creating account…'
                    : 'Signing in…'
                  : isRegister
                  ? 'Create account →'
                  : 'Sign in to Quilio →'}
              </button>
            </motion.div>
          </form>

          {/* Quick Demo Credentials Info Box (Line-by-line) */}
          {!isRegister && (
            <motion.div
              variants={itemVariants}
              className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
                  Demo Credentials
                </span>
                <button
                  type="button"
                  onClick={() => handleFillDemo('aria@quilio.app', 'demo1234')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Auto-fill demo
                </button>
              </div>
              <div className="flex flex-col gap-1 text-neutral-400 font-mono text-[11px]">
                <div>Email: <span className="text-neutral-200">aria@quilio.app</span></div>
                <div>Password: <span className="text-neutral-200">demo1234</span></div>
              </div>
            </motion.div>
          )}

          {/* Footer Line: Switch mode */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-center text-[13px] text-neutral-400"
          >
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode?.('login')}
                  className="font-semibold text-white hover:underline cursor-pointer bg-transparent border-0 p-0 ml-1"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode?.('register')}
                  className="font-semibold text-white hover:underline cursor-pointer bg-transparent border-0 p-0 ml-1"
                >
                  Create free account
                </button>
              </>
            )}
          </motion.div>

          {/* Trust and Engine Footer Line */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2 text-center text-xs text-neutral-500"
          >
            <div className="flex items-center gap-3 text-[11px] tracking-wide text-neutral-400">
              <span>Grounded RAG</span>
              <span>·</span>
              <span>Encrypted Sessions</span>
              <span>·</span>
              <span>TLS</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-600">
              Quilio Sovereign Knowledge Engine
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
