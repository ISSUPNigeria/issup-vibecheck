import { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * Data Use and Consent Form
 *
 * Displayed as the first step in the screening flow.
 * Users must check both consent checkboxes before proceeding.
 */
const ConsentForm = ({ onContinue }) => {
  const [readUnderstood, setReadUnderstood] = useState(false)
  const [agreeParticipate, setAgreeParticipate] = useState(false)

  const canContinue = readUnderstood && agreeParticipate

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">🛡️</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Data Use and Consent
          </h1>
          <p className="text-white/90 text-center mt-2 text-sm sm:text-base">
            Please read this page carefully before continuing
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Section 1: Purpose */}
          <div className="bg-blue-50 border-l-4 border-blue p-4 rounded-r-lg">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-blue">About This Screening:</strong> This screening is designed to help you:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
              <li>Reflect on your use of alcohol or other substances</li>
              <li>Understand potential risks related to substance use</li>
              <li>Explore supportive resources and next steps</li>
            </ul>
          </div>

          {/* Section 2: Important Notice */}
          <div className="bg-orange-50 border-l-4 border-orange p-4 rounded-r-lg">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-orange">⚠ Important:</strong> This screening is <strong>not a diagnosis</strong> and does not replace professional medical or mental health care.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              Taking this screening is <strong>completely voluntary</strong>. Sharing of personal information with the chatbot is also completely at your discretion.
            </p>
          </div>

          {/* Section 3: What We Collect */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">What We Collect</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-2">
              When you take this screening, we will collect:
            </p>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
              <li>Your answers to screening questions about substance use and well-being</li>
              <li>General, non-identifying information (e.g., age range, gender &ndash; optional)</li>
            </ul>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              We <strong>do not</strong> require your name, address, or identifying personal details to complete the screening.
            </p>
          </div>

          {/* Section 4: How Data Is Used */}
          <div className="bg-blue-50 border-l-4 border-blue p-4 rounded-r-lg">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-blue">How Your Data Is Used:</strong> Your information is used to provide personalized feedback and support recommendations, and to improve the quality and effectiveness of this platform.
            </p>
          </div>

          {/* Section 5: Confidentiality */}
          <div className="bg-green-50 border-l-4 border-green p-4 rounded-r-lg">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-green">Confidentiality:</strong> All responses are treated as confidential. Data is stored securely and accessed only by authorized personnel.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              Your information will <strong>not</strong> be shared with employers, schools, family members, or law enforcement.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              It is possible that researchers may access and analyse the data collected through this screening. However, you will not be identified as we do not collect any personal information.
            </p>
          </div>

          {/* Section 6: Limits to Confidentiality */}
          <div className="bg-orange-50 border-l-4 border-orange p-4 rounded-r-lg">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-orange">Limits to Confidentiality:</strong> Confidentiality may be limited only if:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
              <li>There is a serious and immediate risk of harm to you or others</li>
              <li>Disclosure is required by law to protect safety</li>
            </ul>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              If this occurs, we aim to share only the minimum information necessary.
            </p>
          </div>

          {/* Section 7: Need Support? */}
          <div className="bg-red/5 border-l-4 border-red p-4 rounded-r-lg">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-red">Need Support?</strong> Some questions may feel personal or uncomfortable. If you feel distressed, we encourage you to pause and seek support.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              If you are in immediate danger or need urgent help:
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-gray-700">
                📞 Call/WhatsApp: <a href="tel:+2347046526817" className="text-purple font-medium hover:underline">+234 704 652 6817</a>
              </p>
              <p className="text-gray-700">
                💬 WhatsApp: <a href="https://wa.me/2348129378557" className="text-purple font-medium hover:underline" target="_blank" rel="noopener noreferrer">+234 812 937 8557</a>
              </p>
            </div>
          </div>
        </div>

        {/* Consent Footer */}
        <div className="bg-gray-50 px-6 sm:px-8 py-6 border-t border-gray-100">
          <p className="text-gray-700 text-sm font-medium mb-4">
            By clicking &ldquo;I Agree and Continue&rdquo;, you confirm that:
          </p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside mb-5">
            <li>You have read and understood this information</li>
            <li>You are participating voluntarily</li>
            <li>You consent to the use of your responses as described above</li>
          </ul>

          {/* Checkboxes */}
          <div className="space-y-3 mb-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={readUnderstood}
                onChange={(e) => setReadUnderstood(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-purple focus:ring-offset-1"
                style={{ accentColor: '#5B2D91' }}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                I have read and understood the information above
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeParticipate}
                onChange={(e) => setAgreeParticipate(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-purple focus:ring-offset-1"
                style={{ accentColor: '#5B2D91' }}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                I agree to participate and consent to the use of my data
              </span>
            </label>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            You may withdraw your consent at any time by closing the session.
          </p>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className={`px-8 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                canContinue
                  ? 'bg-purple text-white shadow-md hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              I Agree and Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ConsentForm.propTypes = {
  onContinue: PropTypes.func.isRequired,
}

export default ConsentForm