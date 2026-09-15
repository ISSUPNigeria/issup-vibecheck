import { useState } from 'react'

/**
 * ASSIST Q8: Injection Drug Use
 *
 * WHO ASSIST V3.0 Question 8:
 * "Have you ever used any drug by injection? (NON-MEDICAL USE ONLY)"
 *
 * Response options:
 * - No, never (0)
 * - Yes, in the past 3 months (2)
 * - Yes, but not in the past 3 months (1)
 */
const ASSISTInjectionQuestion = ({ question, onComplete, onBack, initialData = null }) => {
  const [response, setResponse] = useState(initialData)

  const handleContinue = () => {
    if (response === null || response === undefined) {
      alert('Please select an answer before continuing.')
      return
    }

    onComplete(response)
  }

  const options = question?.options || [
    { label: 'No, never', score: 0 },
    { label: 'Yes, in the past 3 months', score: 2 },
    { label: 'Yes, but not in the past 3 months', score: 1 }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Q8
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                Injection Drug Use
              </span>
            </div>
            <span className="text-sm text-white/80">
              Final ASSIST Question
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {question?.question_text || 'Have you ever used any drug by injection?'}
          </h2>
          <p className="text-white/90 mt-2 text-sm">
            (Non-medical use only)
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Important Note */}
          <div className="bg-yellow/10 border border-yellow/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This question refers only to non-medical injection drug use.
              Do not include medically prescribed injections (such as insulin or other medications administered by healthcare professionals).
            </p>
          </div>

          {/* Response Options */}
          <div className="space-y-3">
            {options.map((option, idx) => {
              const isSelected = response === option.score

              return (
                <button
                  key={idx}
                  onClick={() => setResponse(option.score)}
                  className={`
                    w-full p-4 border-2 rounded-xl text-left transition-all
                    ${isSelected
                      ? ''
                      : 'border-gray-200 hover:border-purple/50'}
                  `}
                  style={isSelected ? { borderColor: '#75DFE1', backgroundColor: 'rgba(117, 223, 225, 0.1)' } : {}}
                >
                  <div className="flex items-center gap-4">
                    {/* Radio indicator */}
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected
                        ? ''
                        : 'border-gray-300'}
                    `}
                    style={isSelected ? { borderColor: '#124A66', backgroundColor: '#124A66' } : {}}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`
                      font-medium text-sm sm:text-base
                      ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                    `}>
                      {option.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Additional context for recent injection use */}
          {response === 2 && (
            <div className="mt-6 p-4 bg-red/5 border border-red/20 rounded-lg animate-fade-in">
              <p className="text-sm text-gray-700">
                <strong>Support available:</strong> Injection drug use carries significant health risks.
                We want to connect you with appropriate support and resources. Your responses will help us
                provide you with the most relevant assistance.
              </p>
            </div>
          )}
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
              disabled={response === null || response === undefined}
              className={`
                px-8 py-3 font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2
                ${response !== null && response !== undefined
                  ? 'bg-purple text-white hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              `}
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

export default ASSISTInjectionQuestion