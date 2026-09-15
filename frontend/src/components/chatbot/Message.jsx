import { useState } from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'

function Message({
  role,
  content,
  timestamp,
  messageIndex,
  sessionId,
  userMessage,
  onFeedbackSubmit,
  initialFeedback
}) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(initialFeedback || null) // null, 'up', or 'down'
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = async (rating, feedbackComment = null) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await onFeedbackSubmit({
        session_id: sessionId,
        message_index: messageIndex,
        rating: rating,
        comment: feedbackComment,
        user_message: userMessage || '',
        ai_message: content
      })

      setFeedbackGiven(rating === 1 ? 'up' : 'down')
      setShowCommentInput(false)
      setComment('')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleThumbsUp = () => {
    handleFeedback(1)
  }

  const handleThumbsDown = () => {
    setShowCommentInput(true)
    setFeedbackGiven('down')
  }

  const handleCommentSubmit = () => {
    handleFeedback(0, comment || null)
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex items-start max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? 'bg-purple text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {isUser ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative group px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-purple text-white rounded-tr-none'
              : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
          }`}>
            {/* Copy Button - Only for assistant messages */}
            {!isUser && (
              <button
                onClick={handleCopy}
                aria-label={copied ? 'Message copied' : 'Copy message'}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                title={copied ? 'Copied!' : 'Copy message'}
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}

            <div className="text-sm leading-relaxed prose prose-sm max-w-none">
              {isUser ? (
                <p className="whitespace-pre-wrap">{content}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
          </div>

          {/* Timestamp and Feedback - inline */}
          <div className="flex items-center justify-between mt-1 px-2 w-full">
            <div className="flex items-center gap-2">
              {timestamp && (
                <span className="text-xs text-gray-400">
                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {!isUser && copied && (
                <span className="text-xs text-green-600 font-medium">Copied!</span>
              )}
            </div>

            {/* Feedback Buttons - Right side, only for assistant messages */}
            {!isUser && onFeedbackSubmit && feedbackGiven === null && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleThumbsUp}
                  disabled={isSubmitting}
                  aria-label="Mark as helpful"
                  className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2"
                  title="Helpful"
                >
                  <FaThumbsUp size={14} />
                </button>
                <button
                  onClick={handleThumbsDown}
                  disabled={isSubmitting}
                  aria-label="Mark as not helpful"
                  className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2"
                  title="Not helpful"
                >
                  <FaThumbsDown size={14} />
                </button>
              </div>
            )}

            {/* Feedback confirmation - Right side */}
            {!isUser && onFeedbackSubmit && feedbackGiven === 'up' && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FaThumbsUp size={10} className="text-green-500" /> Thanks!
              </span>
            )}
            {!isUser && onFeedbackSubmit && feedbackGiven === 'down' && !showCommentInput && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FaThumbsDown size={10} className="text-red-500" /> Thanks!
              </span>
            )}
          </div>

          {/* Comment input for thumbs down - below timestamp row */}
          {!isUser && onFeedbackSubmit && showCommentInput && (
            <div className="flex flex-col gap-2 mt-2 px-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could be better? (optional)"
                className="text-sm border border-gray-300 rounded px-2 py-1 w-full max-w-[250px] focus:outline-none focus:border-red"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommentSubmit()
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting}
                  className="text-xs bg-red text-white px-3 py-1 rounded hover:bg-red/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
                <button
                  onClick={() => handleFeedback(0, null)}
                  disabled={isSubmitting}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

Message.propTypes = {
  role: PropTypes.oneOf(['user', 'assistant']).isRequired,
  content: PropTypes.string.isRequired,
  timestamp: PropTypes.string,
  messageIndex: PropTypes.number,
  sessionId: PropTypes.string,
  userMessage: PropTypes.string,
  onFeedbackSubmit: PropTypes.func,
  initialFeedback: PropTypes.oneOf(['up', 'down', null])
}

export default Message