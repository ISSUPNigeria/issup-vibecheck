import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../../services/api'

function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('choice') // 'choice' | 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ nickname: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState({ loginPw: false, signupPw: false, confirmPw: false })

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleGuest = () => {
    onClose()
    navigate('/screening')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(loginForm.email, loginForm.password)
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user_nickname', data.nickname)
      localStorage.setItem('user_id', String(data.user_id))
      onClose()
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (signupForm.password !== signupForm.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const data = await register(signupForm.nickname, signupForm.email, signupForm.password)
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user_nickname', data.nickname)
      localStorage.setItem('user_id', String(data.user_id))
      onClose()
      navigate('/screening')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const back = () => { setMode('choice'); setError('') }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header bar */}
        <div className="bg-gradient-to-r from-purple to-teal px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'choice' && 'How would you like to continue?'}
                {mode === 'login'  && 'Welcome back'}
                {mode === 'signup' && 'Create your account'}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                {mode === 'choice' && 'Choose an option to get started'}
                {mode === 'login'  && 'Log in to access your saved history'}
                {mode === 'signup' && 'Save your screening and chat history'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">

          {/* ── CHOICE VIEW ── */}
          {mode === 'choice' && (
            <div className="space-y-3">
              {/* Guest */}
              <button
                onClick={handleGuest}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-purple/40 hover:bg-purple/5 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-purple/10 flex items-center justify-center transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-purple transition-colors">Continue as Guest</p>
                  <p className="text-xs text-gray-500 mt-0.5">No account needed — screening and chat available</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-purple transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Login */}
              <button
                onClick={() => { setMode('login'); setError('') }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-purple/40 hover:bg-purple/5 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-purple/10 flex items-center justify-center transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-purple transition-colors">Log In</p>
                  <p className="text-xs text-gray-500 mt-0.5">Access your saved screening results and chat history</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-purple transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Sign Up */}
              <button
                onClick={() => { setMode('signup'); setError('') }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-purple/30 bg-purple/5 hover:border-purple hover:bg-purple/10 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-purple/10 group-hover:bg-purple/20 flex items-center justify-center transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-purple">Sign Up — It's Free</p>
                  <p className="text-xs text-gray-500 mt-0.5">Save your interactions & get personalised support</p>
                </div>
                <svg className="w-4 h-4 text-purple ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <p className="text-center text-xs text-gray-400 pt-1">
                100% confidential · No data sold · Nigerian-focused support
              </p>
            </div>
          )}

          {/* ── LOGIN VIEW ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red/10 border border-red/20 text-red text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw.loginPw ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Your password"
                    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, loginPw: !p.loginPw }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPw.loginPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw.loginPw ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple hover:bg-purple/90 text-white py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={back} className="text-sm text-gray-500 hover:text-purple transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-sm text-purple hover:underline">
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          )}

          {/* ── SIGNUP VIEW ── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red/10 border border-red/20 text-red text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nickname <span className="text-gray-400 font-normal">(this is how we'll address you)</span>
                </label>
                <input
                  type="text"
                  required
                  value={signupForm.nickname}
                  onChange={e => setSignupForm(p => ({ ...p, nickname: e.target.value }))}
                  placeholder="e.g. Emeka"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw.signupPw ? 'text' : 'password'}
                    required
                    value={signupForm.password}
                    onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, signupPw: !p.signupPw }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPw.signupPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw.signupPw ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input
                    type={showPw.confirmPw ? 'text' : 'password'}
                    required
                    value={signupForm.confirm}
                    onChange={e => setSignupForm(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, confirmPw: !p.confirmPw }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPw.confirmPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw.confirmPw ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple hover:bg-purple/90 text-white py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={back} className="text-sm text-gray-500 hover:text-purple transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button type="button" onClick={() => { setMode('login'); setError('') }} className="text-sm text-purple hover:underline">
                  Already have an account? Log in
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

export default AuthModal
