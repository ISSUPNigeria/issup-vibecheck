import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa'
import Message from './Message'
import ChatInput from './ChatInput'
import PrivacyModal from '../privacy/PrivacyModal'
import PrivacyBanner from '../privacy/PrivacyBanner'
import { generateScreeningPDF } from '../../utils/pdfGenerator'
import { submitFeedback, getValidatedResults, getChatHistory } from '../../services/api'
import api from '../../services/api'


function ChatInterface() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')

  const [messages, setMessages] = useState([])
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true)
  const messagesEndRef = useRef(null)
  const conversationStarted = useRef(false)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check sessionStorage for privacy modal/banner state on mount
  useEffect(() => {
    const hasSeenPrivacyModal = sessionStorage.getItem('privacy_modal_seen')
    if (!hasSeenPrivacyModal) {
      setShowPrivacyModal(true)
    }

    const hasDismissedBanner = sessionStorage.getItem('privacy_banner_dismissed')
    if (hasDismissedBanner) {
      setShowPrivacyBanner(false)
    }
  }, [])

  // Handler for closing privacy modal
  const handleClosePrivacyModal = () => {
    sessionStorage.setItem('privacy_modal_seen', 'true')
    setShowPrivacyModal(false)
  }

  // Handler for dismissing privacy banner
  const handleDismissPrivacyBanner = () => {
    sessionStorage.setItem('privacy_banner_dismissed', 'true')
    setShowPrivacyBanner(false)
  }

  // Initialize conversation on mount
  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }

    // Prevent double call in React StrictMode
    if (conversationStarted.current) return
    conversationStarted.current = true

    const token = localStorage.getItem('auth_token')
    if (token) {
      loadChatHistory()
    } else {
      startConversation()
    }
  }, [sessionId])

  const loadChatHistory = async () => {
    try {
      setLoading(true)
      const history = await getChatHistory(sessionId)
      if (history.length > 0) {
        setMessages(history.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.created_at
        })))
        fetchSessionData()
        setLoading(false)
      } else {
        // Session exists but no messages saved yet — start fresh
        startConversation()
      }
    } catch (err) {
      console.error('Error loading chat history:', err)
      // Fall back to starting a new conversation
      startConversation()
    }
  }

  const startConversation = async () => {
    try {
      setLoading(true)
      const response = await api.post('/api/chat/start', {
        session_id: sessionId
      })

      // Add initial AI greeting
      setMessages([{
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      }])

      // Fetch session data for PDF generation
      fetchSessionData()

      setLoading(false)
    } catch (err) {
      console.error('Error starting conversation:', err)
      setError('Failed to start conversation. Please try again.')
      setLoading(false)
    }
  }

  const fetchSessionData = async () => {
    try {
      const data = await getValidatedResults(sessionId)
      setSessionData(data)
    } catch (err) {
      console.error('Error fetching session data:', err)
    }
  }

  const handleDownloadPDF = async () => {
    if (!sessionData) {
      alert('Unable to generate PDF. Please try again.')
      return
    }

    try {
      setDownloading(true)
      await generateScreeningPDF(sessionData)
      setDownloading(false)
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF. Please try again.')
      setDownloading(false)
    }
  }

  const sendMessage = async (content) => {
    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setSending(true)

    try {
      // Send to backend
      const response = await api.post('/api/chat/message', {
        session_id: sessionId,
        message: content,
        conversation_history: messages
      })

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString(),
        crisis_detected: response.data.crisis_detected,
        resources_provided: response.data.resources_provided
      }

      setMessages(prev => [...prev, aiMessage])
      setSending(false)

    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
      setSending(false)

      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try sending your message again.',
        timestamp: new Date().toISOString()
      }])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Starting conversation...</p>
        </div>
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple text-white py-3 rounded-lg font-semibold hover:bg-purple/90 transition-colors focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Privacy Modal - Shows on first visit */}
      <PrivacyModal isOpen={showPrivacyModal} onClose={handleClosePrivacyModal} />

      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Support Assistant</h2>
                <p className="text-xs sm:text-sm text-gray-500">AI-powered mental health support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="inline-flex items-center justify-center space-x-1 sm:space-x-2 bg-purple text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-purple/90 transition-all text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Download Report</span>
                    <span className="sm:hidden">Report</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigate(`/results?session_id=${sessionId}`)}
                className="text-xs sm:text-sm text-gray-600 hover:text-purple transition-colors flex items-center space-x-1 px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Results</span>
                <span className="sm:hidden">Results</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container - Wrapped messages and input */}
      <div className="flex-1 flex flex-col px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
            {messages.map((message, index) => {
              // Find the preceding user message for AI messages
              const precedingUserMessage = message.role === 'assistant' && index > 0
                ? messages.slice(0, index).reverse().find(m => m.role === 'user')?.content
                : null

              return (
                <Message
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  messageIndex={index}
                  sessionId={sessionId}
                  userMessage={precedingUserMessage}
                  onFeedbackSubmit={message.role === 'assistant' ? submitFeedback : undefined}
                />
              )
            })}

            {/* Typing Indicator */}
            {sending && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Privacy Banner - Persistent reminder */}
          {showPrivacyBanner && (
            <PrivacyBanner onDismiss={handleDismissPrivacyBanner} />
          )}

          {/* Crisis Banner (if crisis detected in any message) */}
          {messages.some(m => m.crisis_detected) && (
            <div className="bg-red px-6 py-3">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-white font-medium">
                    If you're in crisis, please reach out immediately:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 ml-9">
                  <a
                    href="https://wa.me/2348129378557"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 bg-white text-green px-3 py-1 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>+234 812 937 8557</span>
                  </a>
                  <a
                    href="https://wa.me/2349039890177"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 bg-white text-green px-3 py-1 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>+234 903 989 0177</span>
                  </a>
                  <a
                    href="tel:+2347046526817"
                    className="inline-flex items-center space-x-1 bg-white text-red px-3 py-1 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <FaPhoneAlt className="w-4 h-4" />
                    <span>+234 704 652 6817</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-gray-200 bg-white px-3 sm:px-6 py-3 sm:py-4">
            <ChatInput onSend={sendMessage} disabled={sending} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
