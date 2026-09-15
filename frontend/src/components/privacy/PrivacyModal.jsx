/**
 * Privacy Modal Component
 *
 * Displays a privacy warning modal when users first enter the chat.
 * Informs users about data privacy best practices and what not to share.
 */

import { FaShieldAlt, FaLock, FaExclamationTriangle } from 'react-icons/fa';

function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - clicking does NOT dismiss (must click button) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-bounce-in">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple to-blue px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Your Privacy Matters</h2>
          <p className="text-white/80 mt-2 text-sm">
            We are committed to protecting your personal information
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="flex items-start space-x-3 mb-4">
            <FaExclamationTriangle className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
            <p className="text-gray-700 text-sm">
              To protect your privacy during our conversation, please <strong>avoid sharing</strong>:
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="w-2 h-2 bg-purple rounded-full flex-shrink-0" />
              <span>Your full name</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="w-2 h-2 bg-purple rounded-full flex-shrink-0" />
              <span>Phone numbers</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="w-2 h-2 bg-purple rounded-full flex-shrink-0" />
              <span>Email addresses</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="w-2 h-2 bg-purple rounded-full flex-shrink-0" />
              <span>Physical addresses or location details</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="w-2 h-2 bg-purple rounded-full flex-shrink-0" />
              <span>Other identifying information</span>
            </li>
          </ul>

          <div className="bg-purple/5 border border-purple/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <FaLock className="w-4 h-4 text-purple flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                <strong className="text-purple">Note:</strong> Any personal information you
                accidentally share may be automatically protected for your safety.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-purple hover:bg-purple/90 text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyModal;