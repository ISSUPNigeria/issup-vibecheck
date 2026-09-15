import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaPhoneAlt } from 'react-icons/fa'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [nickname, setNickname] = useState(null)

  useEffect(() => {
    setNickname(localStorage.getItem('user_nickname'))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_nickname')
    localStorage.removeItem('user_id')
    setNickname(null)
    navigate('/')
  }

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* VibeCheck Logo/Brand */}
          <Link to="/" className="group">
            <img
              src="/vibeCheck_logo.png"
              alt="VibeCheck"
              className="h-12 sm:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${location.pathname === '/'
                ? 'text-purple'
                : 'text-gray-600 hover:text-purple'
                }`}
            >
              Home
            </Link>
            <Link
              to="/screening"
              className={`text-sm font-medium transition-colors ${location.pathname === '/screening'
                ? 'text-purple'
                : 'text-gray-600 hover:text-purple'
                }`}
            >
              Screening
            </Link>
            {nickname && (
              <Link
                to="/chat"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/chat'
                    ? 'text-purple'
                    : 'text-gray-600 hover:text-purple'
                }`}
              >
                My History
              </Link>
            )}
            <a
              href="tel:+2347046526817"
              className="text-sm font-medium text-red hover:text-red/80 transition-colors flex items-center space-x-1"
              title="Crisis Support - Call/WhatsApp"
            >
              <span className="text-lg">🚨</span>
              <FaPhoneAlt className="w-4 h-4" />
              <span>+234 704 652 6817</span>
            </a>

            {/* Auth State */}
            {nickname ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Hello, <span className="text-purple font-semibold">{nickname}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/?login=true')}
                className="text-sm font-medium bg-purple text-white px-4 py-1.5 rounded-lg hover:bg-purple/90 transition-colors"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-purple min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg animate-slide-down z-50">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium py-2 transition-colors ${location.pathname === '/'
                ? 'text-purple'
                : 'text-gray-600 hover:text-purple'
                }`}
            >
              Home
            </Link>
            <Link
              to="/screening"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium py-2 transition-colors ${location.pathname === '/screening'
                ? 'text-purple'
                : 'text-gray-600 hover:text-purple'
                }`}
            >
              Start Screening
            </Link>

            {nickname && (
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-2 transition-colors ${
                  location.pathname === '/chat'
                    ? 'text-purple'
                    : 'text-gray-600 hover:text-purple'
                }`}
              >
                My History
              </Link>
            )}

            {/* Mobile Auth State */}
            {nickname ? (
              <>
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-sm text-gray-500">
                    Signed in as <span className="font-semibold text-purple">{nickname}</span>
                  </p>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                  className="text-base font-medium py-2 text-red transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => { navigate('/?login=true'); setMobileMenuOpen(false) }}
                className="text-base font-medium py-2 text-purple transition-colors text-left"
              >
                Login / Sign Up
              </button>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-2">Crisis Support 24/7</p>
              <a
                href="tel:+2347046526817"
                className="flex items-center space-x-2 text-red font-semibold py-2"
              >
                <span className="text-lg">🚨</span>
                <FaPhoneAlt className="w-4 h-4" />
                <span>+234 704 652 6817</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header