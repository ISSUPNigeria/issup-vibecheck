import { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * PGSI — Problem Gambling Severity Index
 *
 * 9 questions, each rated on a 4-point scale:
 * Never (0), Sometimes (1), Most of the time (2), Almost always (3)
 *
 * Risk categories:
 *   0      → No risk
 *   1–4    → Low risk
 *   5–7    → Moderate risk
 *   8+     → Problem gambler
 */

const PGSI_QUESTIONS = [
  { number: 1, text: 'Have you bet more than you could really afford to lose?' },
  { number: 2, text: 'Have you needed to gamble with larger amounts of money to get the same feeling of excitement?' },
  { number: 3, text: 'When you gambled, did you go back another day to try to win back the money you lost?' },
  { number: 4, text: 'Have you borrowed money or sold anything to get money to gamble?' },
  { number: 5, text: 'Have you felt that you might have a problem with gambling?' },
  { number: 6, text: 'Has gambling caused you any health problems, including stress or anxiety?' },
  { number: 7, text: 'Have people criticised your betting or told you that you had a gambling problem, regardless of whether or not you thought it was true?' },
  { number: 8, text: 'Has your gambling caused any financial problems for you or your household?' },
  { number: 9, text: 'Have you felt guilty about the way you gamble or what happens when you gamble?' },
]

const SCALE_OPTIONS = [
  { label: 'Never',           value: 0 },
  { label: 'Sometimes',       value: 1 },
  { label: 'Most of the time', value: 2 },
  { label: 'Almost always',   value: 3 },
]

const PGSIScreening = ({ onComplete, onBack, initialData = {} }) => {
  const [responses, setResponses] = useState(initialData?.responses || {})

  const answeredCount = Object.keys(responses).length
  const allAnswered = answeredCount === 9

  const handleChange = (questionNumber, value) => {
    setResponses(prev => ({ ...prev, [questionNumber]: value }))
  }

  const handleContinue = () => {
    if (!allAnswered) {
      alert('Please answer all 9 questions before continuing.')
      return
    }
    onComplete({ responses })
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              PGSI Screening
            </span>
            <span className="text-sm text-white/80">
              {answeredCount} of 9 answered
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            Thinking about the last 12 months, how often have the following applied to you?
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="p-4 sm:p-6 space-y-4">
          {PGSI_QUESTIONS.map((question) => {
            const current = responses[question.number]
            const isAnswered = current !== undefined

            return (
              <div
                key={question.number}
                className={`border-2 rounded-xl p-4 transition-all ${
                  isAnswered
                    ? 'border-purple bg-purple/5'
                    : 'border-gray-200 hover:border-purple/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center font-bold text-sm">
                    {question.number}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold text-base sm:text-xl leading-relaxed">
                      {question.text}
                    </p>
                  </div>
                  {isAnswered && (
                    <span className="text-green text-sm font-medium flex-shrink-0">✓</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 ml-11">
                  {SCALE_OPTIONS.map((option) => {
                    const isSelected = current === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleChange(question.number, option.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-purple text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-100">
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </span>
              </button>
            )}
            <button
              onClick={handleContinue}
              disabled={!allAnswered}
              className={`px-8 py-3 font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                allAnswered
                  ? 'bg-purple text-white hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

PGSIScreening.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  initialData: PropTypes.shape({
    responses: PropTypes.object,
  }),
}

export default PGSIScreening