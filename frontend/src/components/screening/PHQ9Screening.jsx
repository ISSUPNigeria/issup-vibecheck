import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

/**
 * PHQ-9 Depression Screening
 *
 * Patient Health Questionnaire-9 (PHQ-9):
 * 9 depression symptom questions + 1 functional impairment question
 *
 * Scale: Not at all (0), Several days (1), More than half the days (2), Nearly every day (3)
 * Q9 is the suicide ideation question - flagged as crisis if > 0
 */

// Hardcoded PHQ-9 questions (symptom text only - intro shown in header)
const PHQ9_QUESTIONS = [
  { number: 1, text: 'Little interest or pleasure in doing things' },
  { number: 2, text: 'Feeling down, depressed, or hopeless' },
  { number: 3, text: 'Trouble falling or staying asleep, or sleeping too much' },
  { number: 4, text: 'Feeling tired or having little energy' },
  { number: 5, text: 'Poor appetite or overeating' },
  { number: 6, text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down' },
  { number: 7, text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
  { number: 8, text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual' },
  { number: 9, text: 'Thoughts that you would be better off dead or of hurting yourself in some way', isCrisis: true }
]

// Response options (scores handled in background)
const SCALE_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 }
]

const FUNCTIONAL_OPTIONS = [
  { label: 'Not difficult at all', value: 'not_difficult' },
  { label: 'Somewhat difficult', value: 'somewhat_difficult' },
  { label: 'Very difficult', value: 'very_difficult' },
  { label: 'Extremely difficult', value: 'extremely_difficult' }
]

const PHQ9Screening = ({ onComplete, onBack, initialData = {} }) => {
  const [responses, setResponses] = useState(initialData?.responses || {})
  const [functionalImpairment, setFunctionalImpairment] = useState(initialData?.functional_impairment || null)
  const [showFunctionalQuestion, setShowFunctionalQuestion] = useState(false)

  const allQuestionsAnswered = Object.keys(responses).length === 9
  const answeredCount = Object.keys(responses).length

  // Show functional impairment question only if any symptom was reported
  useEffect(() => {
    const hasAnySymptoms = Object.values(responses).some(val => val > 0)
    setShowFunctionalQuestion(hasAnySymptoms)
    if (!hasAnySymptoms) {
      setFunctionalImpairment('not_difficult')
    }
  }, [responses])

  const handleResponseChange = (questionNumber, value) => {
    setResponses(prev => ({
      ...prev,
      [questionNumber]: value
    }))
  }

  const handleContinue = () => {
    if (!allQuestionsAnswered) {
      alert('Please answer all 9 questions before continuing.')
      return
    }
    if (showFunctionalQuestion && !functionalImpairment) {
      alert('Please answer the final question about difficulty in daily activities.')
      return
    }
    onComplete({
      responses,
      functional_impairment: functionalImpairment || 'not_difficult'
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header - Common intro shown once */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              PHQ-9 Screening
            </span>
            <span className="text-sm text-white/80">
              {answeredCount} of 9 answered
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            Over the last 2 weeks, how often have you been bothered by the following problems?
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="p-4 sm:p-6 space-y-4">
          {PHQ9_QUESTIONS.map((question) => {
            const currentValue = responses[question.number]
            const isAnswered = currentValue !== undefined
            const isQ9 = question.isCrisis

            return (
              <div
                key={question.number}
                className={`
                  border-2 rounded-xl p-4 transition-all
                  ${isQ9 && currentValue > 0
                    ? 'border-red bg-red-50'
                    : isAnswered
                      ? 'border-green bg-green/5'
                      : isQ9
                        ? 'border-red/30 bg-red-50/30'
                        : 'border-gray-200 hover:border-purple/50'}
                `}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <span className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${isQ9 ? 'bg-red text-white' : 'bg-purple text-white'}
                  `}>
                    {question.number}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold text-base sm:text-xl leading-relaxed">
                      {question.text}
                    </p>
                    {isQ9 && (
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        ⚠️ Important safety question
                      </p>
                    )}
                  </div>
                  {isAnswered && (
                    <span className="text-green text-sm font-medium flex-shrink-0">
                      ✓
                    </span>
                  )}
                </div>

                {/* Pill Buttons */}
                <div className="flex flex-wrap gap-2 ml-11">
                  {SCALE_OPTIONS.map((option) => {
                    const isSelected = currentValue === option.value

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleResponseChange(question.number, option.value)}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-purple text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
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

        {/* Functional Impairment Question */}
        {showFunctionalQuestion && (
          <div className="mx-4 sm:mx-6 mb-4 p-4 sm:p-6 bg-blue/5 border-2 border-blue/30 rounded-xl animate-fade-in">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?
            </h3>
            <div className="flex flex-wrap gap-2">
              {FUNCTIONAL_OPTIONS.map((option) => {
                const isSelected = functionalImpairment === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => setFunctionalImpairment(option.value)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${isSelected
                        ? 'bg-blue text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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
              disabled={!allQuestionsAnswered || (showFunctionalQuestion && !functionalImpairment)}
              className={`
                px-8 py-3 font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2
                ${allQuestionsAnswered && (!showFunctionalQuestion || functionalImpairment)
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

PHQ9Screening.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  initialData: PropTypes.shape({
    responses: PropTypes.object,
    functional_impairment: PropTypes.string
  })
}

export default PHQ9Screening