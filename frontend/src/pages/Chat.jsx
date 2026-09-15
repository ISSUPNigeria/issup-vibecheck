import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../components/shared/Header'
import ChatInterface from '../components/chatbot/ChatInterface'
import { getUserSessions } from '../services/api'

// Map risk level strings to badge colors
const riskBadge = {
  low:      { label: 'Low Risk',      cls: 'bg-green/10 text-green-700 border-green/30' },
  moderate: { label: 'Moderate Risk', cls: 'bg-orange/10 text-orange-700 border-orange/30' },
  high:     { label: 'High Risk',     cls: 'bg-red/10 text-red border-red/30' },
}

const phq9Badge = {
  Minimal:             { cls: 'bg-green/10 text-green-700 border-green/30' },
  Mild:                { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  Moderate:            { cls: 'bg-orange/10 text-orange-700 border-orange/30' },
  'Moderately Severe': { cls: 'bg-red/10 text-red border-red/30' },
  Severe:              { cls: 'bg-red/20 text-red border-red/40' },
}

function formatDate(isoString) {
  if (!isoString) return 'Unknown date'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SessionCard({ session, onContinue, onViewResults }) {
  const risk = riskBadge[session.overall_risk] || null
  const phq9 = phq9Badge[session.phq9_severity] || null

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 hover:border-purple/20 transition-all duration-300 p-5 sm:p-6 flex flex-col gap-4">
      {/* Date & message count */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Screening date</p>
          <p className="text-sm font-semibold text-gray-800">{formatDate(session.created_at)}</p>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>{session.message_count} message{session.message_count !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Risk badges */}
      <div className="flex flex-wrap gap-2">
        {risk && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${risk.cls}`}>
            {risk.label}
          </span>
        )}
        {phq9 && session.phq9_severity && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${phq9.cls}`}>
            PHQ-9: {session.phq9_severity}
          </span>
        )}
        {!risk && !phq9 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-500 border-gray-200">
            Results pending
          </span>
        )}
      </div>

      {/* Substances */}
      {session.substances && session.substances.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Flagged substances</p>
          <div className="flex flex-wrap gap-1.5">
            {session.substances.map(sub => (
              <span key={sub} className="px-2 py-0.5 bg-purple/10 text-purple rounded-md text-xs font-medium capitalize">
                {sub}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onViewResults(session.session_id)}
          className="flex-1 border border-purple text-purple bg-white hover:bg-purple/5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Results
        </button>
        <button
          onClick={() => onContinue(session.session_id)}
          className="flex-1 bg-purple hover:bg-purple/90 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Continue
        </button>
      </div>
    </div>
  )
}

function SessionsList() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const nickname = localStorage.getItem('user_nickname')

  useEffect(() => {
    getUserSessions()
      .then(data => {
        setSessions(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load sessions:', err)
        setError('Could not load your conversations. Please try again.')
        setLoading(false)
      })
  }, [])

  const handleContinue = (sessionId) => {
    navigate(`/chat?session_id=${sessionId}`)
  }

  const handleViewResults = (sessionId) => {
    navigate(`/results?session_id=${sessionId}&from=history`)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your screening history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Your Screening History
          </h1>
          {nickname && (
            <p className="text-gray-500 text-sm sm:text-base">
              Welcome back, <span className="font-medium text-purple">{nickname}</span>. Here are all your past screenings and conversations.
            </p>
          )}
        </div>

        {sessions.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Complete a screening to start a conversation with the AI support assistant.
            </p>
            <button
              onClick={() => navigate('/screening')}
              className="bg-purple hover:bg-purple/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Start a New Screening
            </button>
          </div>
        ) : (
          <>
            {/* New screening CTA */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => navigate('/screening')}
                className="inline-flex items-center gap-2 text-sm font-medium text-purple hover:text-purple/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Screening
              </button>
            </div>

            {/* Sessions grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sessions.map(session => (
                <SessionCard
                  key={session.session_id}
                  session={session}
                  onContinue={handleContinue}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Chat() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')
  const token = localStorage.getItem('auth_token')

  // No session_id in URL
  if (!sessionId) {
    if (token) {
      // Logged-in user: show their sessions list
      return (
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <SessionsList />
        </div>
      )
    } else {
      // Guest with no session: redirect home
      navigate('/')
      return null
    }
  }

  // session_id present: render the chat interface normally
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  )
}

export default Chat