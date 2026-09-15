import { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * ASSIST Q2-Q7: Question-Centric Format
 *
 * NEW Design: Shows one question at a time with all substances
 * - Q2: Frequency of use (past 3 months)
 * - Q3: Strong desire/urge to use (past 3 months)
 * - Q4: Health, social, legal, financial problems (past 3 months)
 * - Q5: Failed to do what was expected (past 3 months) - SKIP FOR TOBACCO
 * - Q6: Friend/relative/healthcare worker concerned (ever)
 * - Q7: Tried to control/cut down/stop (ever)
 *
 * Format: Card per substance with pill buttons for frequency options
 */

// Question definitions with WHO ASSIST V3.0 scoring
const QUESTIONS = {
  2: {
    number: 2,
    text: 'In the past three months, how often have you used [substance]?',
    shortText: 'Frequency of Use',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Once or Twice', score: 2 },
      { label: 'Monthly', score: 3 },
      { label: 'Weekly', score: 4 },
      { label: 'Daily or Almost Daily', score: 6 }
    ]
  },
  3: {
    number: 3,
    text: 'During the past three months, how often have you had a strong desire or urge to use [substance]?',
    shortText: 'Strong Desire or Urge',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Once or Twice', score: 3 },
      { label: 'Monthly', score: 4 },
      { label: 'Weekly', score: 5 },
      { label: 'Daily or Almost Daily', score: 6 }
    ]
  },
  4: {
    number: 4,
    text: 'During the past three months, how often has your use of [substance] led to health, social, legal or financial problems?',
    shortText: 'Problems Caused',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Once or Twice', score: 4 },
      { label: 'Monthly', score: 5 },
      { label: 'Weekly', score: 6 },
      { label: 'Daily or Almost Daily', score: 7 }
    ]
  },
  5: {
    number: 5,
    text: 'During the past three months, how often have you failed to do what was normally expected of you because of your use of [substance]?',
    shortText: 'Failed Expectations',
    skipForTobacco: true,
    options: [
      { label: 'Never', score: 0 },
      { label: 'Once or Twice', score: 5 },
      { label: 'Monthly', score: 6 },
      { label: 'Weekly', score: 7 },
      { label: 'Daily or Almost Daily', score: 8 }
    ]
  },
  6: {
    number: 6,
    text: 'Has a friend, relative or anyone else ever expressed concern about your use of [substance]?',
    shortText: 'Concern from Others',
    options: [
      { label: 'No, Never', score: 0 },
      { label: 'Yes, in the past 3 months', score: 6 },
      { label: 'Yes, but not in the past 3 months', score: 3 }
    ]
  },
  7: {
    number: 7,
    text: 'Have you ever tried and failed to control, cut down or stop using [substance]?',
    shortText: 'Tried to Control',
    options: [
      { label: 'No, Never', score: 0 },
      { label: 'Yes, in the past 3 months', score: 6 },
      { label: 'Yes, but not in the past 3 months', score: 3 }
    ]
  }
}

// Substance display info
const SUBSTANCE_INFO = {
  tobacco: { name: 'Tobacco', icon: '🚬' },
  alcohol: { name: 'Alcohol', icon: '🍺' },
  cannabis: { name: 'Cannabis', icon: '🌿' },
  cocaine: { name: 'Cocaine', icon: '💎' },
  amphetamines: { name: 'Amphetamines', icon: '⚡' },
  inhalants: { name: 'Inhalants', icon: '💨' },
  sedatives: { name: 'Sedatives', icon: '💊' },
  hallucinogens: { name: 'Hallucinogens', icon: '🍄' },
  opioids: { name: 'Opioids', icon: '💉' },
  other: { name: 'Other', icon: '❓' }
}

// Get substance info, handling custom "other_X:Name" format
const getSubstanceInfo = (substance) => {
  // Check if it's a custom "other" substance (format: "other_0:Khat")
  if (substance.startsWith('other_') && substance.includes(':')) {
    const customName = substance.split(':')[1]
    return {
      name: customName.charAt(0).toUpperCase() + customName.slice(1),
      icon: '💊'
    }
  }
  return SUBSTANCE_INFO[substance] || { name: substance, icon: '❓' }
}

// Get the base substance ID for storage (other_0:Khat -> other_0)
const getSubstanceKey = (substance) => {
  if (substance.startsWith('other_') && substance.includes(':')) {
    return substance.split(':')[0]
  }
  return substance
}

const ASSISTQuestions = ({ questions, selectedSubstances, onComplete, onBack, initialData = null }) => {
  // Get the question sequence (2, 3, 4, 5, 6, 7)
  const questionSequence = [2, 3, 4, 5, 6, 7]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Responses stored as: { substanceKey: { questionNumber: score } }
  const [responses, setResponses] = useState(() => {
    if (initialData) {
      return initialData
    }
    // Initialize empty response structure for all selected substances
    const initial = {}
    selectedSubstances.forEach(sub => {
      const key = getSubstanceKey(sub)
      initial[key] = {}
    })
    return initial
  })

  // Get substances to assess (including 'other' if selected)
  const substancesToAssess = selectedSubstances

  // Current question info
  const currentQuestionNumber = questionSequence[currentQuestionIndex]
  const currentQuestion = QUESTIONS[currentQuestionNumber]

  // Get substances for current question (Q5 skips tobacco)
  const getSubstancesForQuestion = (qNum) => {
    if (qNum === 5) {
      // Skip tobacco for Q5 (WHO specification)
      return substancesToAssess.filter(sub => {
        const key = getSubstanceKey(sub)
        return key !== 'tobacco'
      })
    }
    return substancesToAssess
  }

  const currentSubstances = getSubstancesForQuestion(currentQuestionNumber)

  // Handle response for a substance
  const handleResponse = (substance, score) => {
    const key = getSubstanceKey(substance)
    setResponses(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [currentQuestionNumber]: score
      }
    }))
  }

  // Check if all substances have been answered for current question
  const allAnsweredForQuestion = () => {
    return currentSubstances.every(sub => {
      const key = getSubstanceKey(sub)
      return responses[key] && responses[key][currentQuestionNumber] !== undefined
    })
  }

  // Count answered for current question
  const answeredCount = currentSubstances.filter(sub => {
    const key = getSubstanceKey(sub)
    return responses[key] && responses[key][currentQuestionNumber] !== undefined
  }).length

  // Navigate to next question
  const handleNext = () => {
    if (!allAnsweredForQuestion()) {
      alert('Please answer for all substances before continuing.')
      return
    }

    if (currentQuestionIndex < questionSequence.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // All questions completed
      onComplete(responses)
    }
  }

  // Navigate to previous question
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (onBack) {
      onBack()
    }
  }

  // Get question text with substance placeholder (singular/plural based on count)
  const getQuestionText = () => {
    const substanceCount = currentSubstances.length
    const substanceWord = substanceCount === 1 ? 'this substance' : 'these substances'
    return currentQuestion.text.replace('[substance]', substanceWord)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Q{currentQuestionNumber}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                {currentQuestion.shortText}
              </span>
            </div>
            <span className="text-sm text-white/80">
              {answeredCount} of {currentSubstances.length} answered
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {getQuestionText()}
          </h2>
        </div>

        {/* Question Progress */}
        <div className="px-6 pt-4">
          <div className="flex justify-between items-center mb-2">
            {questionSequence.map((qNum, idx) => {
              const isActive = idx === currentQuestionIndex
              const isCompleted = idx < currentQuestionIndex
              const isSkipped = qNum === 5 && !substancesToAssess.includes('tobacco') && substancesToAssess.every(s => s !== 'tobacco')

              return (
                <div key={qNum} className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${isActive ? 'bg-purple text-white' : ''}
                      ${isCompleted ? 'text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                    style={isCompleted ? { backgroundColor: '#CDB4EC', color: '#5B2D91' } : {}}
                  >
                    {isCompleted ? '✓' : `Q${qNum}`}
                  </div>
                  {idx < questionSequence.length - 1 && (
                    <div className={`h-1 w-6 sm:w-12 mx-1 ${isCompleted ? '' : 'bg-gray-200'}`} style={isCompleted ? { backgroundColor: '#CDB4EC' } : {}} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Substance Cards */}
        <div className="p-4 sm:p-6 space-y-4">
          {currentSubstances.map((substance) => {
            const substanceInfo = getSubstanceInfo(substance)
            const key = getSubstanceKey(substance)
            const currentValue = responses[key]?.[currentQuestionNumber]

            return (
              <div
                key={substance}
                className={`
                  border-2 rounded-xl p-4 transition-all
                  ${currentValue !== undefined
                    ? ''
                    : 'border-gray-200 hover:border-purple/50'}
                `}
                style={currentValue !== undefined ? { borderColor: '#75DFE1', backgroundColor: 'rgba(117, 223, 225, 0.1)' } : {}}
              >
                {/* Substance Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    {substanceInfo.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {substanceInfo.name}
                  </h3>
                  {currentValue !== undefined && (
                    <span className="ml-auto text-sm font-medium" style={{ color: '#124A66' }}>
                      ✓ Answered
                    </span>
                  )}
                </div>

                {/* Pill Buttons */}
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = currentValue === option.score

                    return (
                      <button
                        key={idx}
                        onClick={() => handleResponse(substance, option.score)}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-all
                          ${isSelected
                            ? 'text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                        style={isSelected ? { backgroundColor: '#124A66' } : {}}
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

        {/* Q5 Tobacco Note */}
        {currentQuestionNumber === 5 && substancesToAssess.includes('tobacco') && (
          <div className="mx-4 sm:mx-6 mb-4 p-4 bg-blue/5 border border-blue/20 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This question does not apply to tobacco (per WHO ASSIST guidelines).
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-100">
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {currentQuestionIndex === 0 ? 'Back' : 'Previous Question'}
              </span>
            </button>
            <button
              onClick={handleNext}
              disabled={!allAnsweredForQuestion()}
              className={`
                px-8 py-3 font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2
                ${allAnsweredForQuestion()
                  ? 'bg-purple text-white hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              `}
            >
              {currentQuestionIndex < questionSequence.length - 1 ? 'Next Question' : 'Continue'}
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

ASSISTQuestions.propTypes = {
  questions: PropTypes.array,
  selectedSubstances: PropTypes.arrayOf(PropTypes.string).isRequired,
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  initialData: PropTypes.object
}

export default ASSISTQuestions