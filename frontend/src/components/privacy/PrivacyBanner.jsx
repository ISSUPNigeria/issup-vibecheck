/**
 * Privacy Banner Component
 *
 * A persistent, dismissible banner that reminds users about privacy best practices.
 * Displayed above the chat input area.
 */

import { FaShieldAlt, FaTimes } from 'react-icons/fa';

function PrivacyBanner({ onDismiss }) {
  return (
    <div className="bg-purple/10 border-l-4 border-purple px-4 py-2.5 animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaShieldAlt className="w-4 h-4 text-purple flex-shrink-0" />
          <span className="text-sm text-gray-700">
            <strong className="text-purple">Privacy tip:</strong> Avoid sharing personal info (name, phone, email)
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          aria-label="Dismiss privacy reminder"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default PrivacyBanner;