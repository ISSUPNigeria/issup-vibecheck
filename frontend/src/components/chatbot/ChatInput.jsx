import { useState } from 'react'
import PropTypes from 'prop-types'

function ChatInput({ onSend, disabled = false }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end space-x-3">
        {/* Input Field */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={disabled}
            rows="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple/50 focus:border-purple disabled:bg-gray-100 disabled:cursor-not-allowed transition-all overflow-y-hidden"
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              // Show scrollbar only when content exceeds max height
              if (e.target.scrollHeight > 120) {
                e.target.style.overflowY = 'auto'
              } else {
                e.target.style.overflowY = 'hidden'
              }
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`flex-shrink-0 p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 ${
            message.trim() && !disabled
              ? 'bg-purple text-white hover:bg-purple/90 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {disabled ? (
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2 px-1 sm:px-2">
        <p className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
        <p className="text-xs text-gray-400 hidden sm:block">
          AI assistant, not professional care
        </p>
      </div>
    </form>
  )
}

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default ChatInput
