import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FaThumbsUp, FaThumbsDown, FaCheck } from 'react-icons/fa'
import { submitResultsFeedback, getTabFeedback } from '../../services/api'

/**
 * Bold, prominent feedback component for Results page tabs
 * Contextual colors per tab theme
 */
function ResultsFeedback({
  sessionId,
  tabName,
  tabContentSummary,
  colorTheme = 'purple' // purple, orange, blue, green
}) {
  const [rating, setRating] = useState(null) // null, 1 (up), or 0 (down)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)

  // Color themes matching each tab
  const themes = {
    purple: {
      bg: 'bg-gradient-to-r from-purple/5 to-purple/10',
      border: 'border-purple/30',
      accent: 'text-purple',
      buttonUp: 'bg-green hover:bg-green/90 text-white',
      buttonUpActive: 'bg-green text-white ring-4 ring-green/30',
      buttonDown: 'bg-red hover:bg-red/90 text-white',
      buttonDownActive: 'bg-red text-white ring-4 ring-red/30',
      buttonInactive: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
    },
    orange: {
      bg: 'bg-gradient-to-r from-orange/5 to-orange/10',
      border: 'border-orange/30',
      accent: 'text-orange',
      buttonUp: 'bg-green hover:bg-green/90 text-white',
      buttonUpActive: 'bg-green text-white ring-4 ring-green/30',
      buttonDown: 'bg-red hover:bg-red/90 text-white',
      buttonDownActive: 'bg-red text-white ring-4 ring-red/30',
      buttonInactive: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue/5 to-blue/10',
      border: 'border-blue/30',
      accent: 'text-blue',
      buttonUp: 'bg-green hover:bg-green/90 text-white',
      buttonUpActive: 'bg-green text-white ring-4 ring-green/30',
      buttonDown: 'bg-red hover:bg-red/90 text-white',
      buttonDownActive: 'bg-red text-white ring-4 ring-red/30',
      buttonInactive: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
    },
    green: {
      bg: 'bg-gradient-to-r from-green/5 to-green/10',
      border: 'border-green/30',
      accent: 'text-green',
      buttonUp: 'bg-green hover:bg-green/90 text-white',
      buttonUpActive: 'bg-green text-white ring-4 ring-green/30',
      buttonDown: 'bg-red hover:bg-red/90 text-white',
      buttonDownActive: 'bg-red text-white ring-4 ring-red/30',
      buttonInactive: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
    }
  }

  const colors = themes[colorTheme] || themes.purple

  // Load existing feedback on mount
  useEffect(() => {
    const loadExistingFeedback = async () => {
      try {
        const existing = await getTabFeedback(sessionId, tabName)
        if (existing) {
          setRating(existing.rating)
          setSubmitted(true)
          setIsUpdate(true)
        }
      } catch (error) {
        // No existing feedback, which is fine
        console.log('No existing feedback for tab:', tabName)
      }
    }

    if (sessionId && tabName) {
      loadExistingFeedback()
    }
  }, [sessionId, tabName])

  const handleThumbsUp = async () => {
    if (isSubmitting) return

    setRating(1)
    setShowCommentInput(false)
    await submitFeedback(1, null)
  }

  const handleThumbsDown = () => {
    if (isSubmitting) return

    setRating(0)
    setShowCommentInput(true)
  }

  const submitFeedback = async (feedbackRating, feedbackComment) => {
    setIsSubmitting(true)
    try {
      const response = await submitResultsFeedback({
        session_id: sessionId,
        tab_name: tabName,
        rating: feedbackRating,
        comment: feedbackComment,
        tab_content_summary: tabContentSummary
      })

      setSubmitted(true)
      setIsUpdate(response.is_update)
      setShowCommentInput(false)
    } catch (error) {
      console.error('Failed to submit results feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentSubmit = async () => {
    await submitFeedback(0, comment || null)
  }

  const handleChangeRating = () => {
    // Allow user to re-rate
    setSubmitted(false)
    setRating(null)
    setShowCommentInput(false)
    setComment('')
  }

  return (
    <div className={`mt-6 sm:mt-10 ${colors.bg} border-2 ${colors.border} rounded-xl p-4 sm:p-6 shadow-md`}>
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h3 className={`text-lg sm:text-xl font-bold ${colors.accent} mb-2`}>
          Was this information helpful?
        </h3>
        <p className="text-gray-600 text-sm">
          Your feedback helps us improve this tool
        </p>
      </div>

      {/* Feedback Buttons */}
      {!submitted ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
            <button
              onClick={handleThumbsUp}
              disabled={isSubmitting}
              aria-label="Yes, this information was helpful"
              className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold sm:font-bold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2 ${
                rating === 1 ? colors.buttonUpActive : colors.buttonUp
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaThumbsUp size={20} className="sm:w-6 sm:h-6" />
              <span>Yes, helpful!</span>
            </button>

            <button
              onClick={handleThumbsDown}
              disabled={isSubmitting}
              aria-label="No, this information was not helpful"
              className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold sm:font-bold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 ${
                rating === 0 ? colors.buttonDownActive : colors.buttonDown
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaThumbsDown size={20} className="sm:w-6 sm:h-6" />
              <span>Not really</span>
            </button>
          </div>

          {/* Comment Input (shown on thumbs down) */}
          {showCommentInput && (
            <div className="mt-6 animate-fade-in">
              <label className="block text-gray-700 font-semibold mb-2">
                What could we improve? (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us how we can make this more helpful..."
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 resize-none"
                rows={3}
              />
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting}
                  className="bg-purple text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple/90 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button
                  onClick={() => submitFeedback(0, null)}
                  disabled={isSubmitting}
                  className="text-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Thank You State */
        <div className="text-center animate-fade-in">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl ${
            rating === 1 ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
          }`}>
            <FaCheck size={20} />
            <span className="font-bold text-lg">
              Thank you for your feedback!
            </span>
            {rating === 1 ? (
              <FaThumbsUp size={20} />
            ) : (
              <FaThumbsDown size={20} />
            )}
          </div>

          {/* Option to change rating */}
          <div className="mt-4">
            <button
              onClick={handleChangeRating}
              className="text-sm text-gray-500 hover:text-gray-700 underline rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple/30"
            >
              Change my feedback
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

ResultsFeedback.propTypes = {
  sessionId: PropTypes.string.isRequired,
  tabName: PropTypes.oneOf(['overview', 'assist', 'phq9', 'triggers', 'next-steps']).isRequired,
  tabContentSummary: PropTypes.object.isRequired,
  colorTheme: PropTypes.oneOf(['purple', 'orange', 'blue', 'green'])
}

export default ResultsFeedback