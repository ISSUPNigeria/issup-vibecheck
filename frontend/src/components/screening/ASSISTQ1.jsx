import { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * ASSIST Q1: Lifetime Substance Use (Yes/No per substance)
 *
 * WHO ASSIST V3.0 Question 1:
 * "In your life, which of the following substances have you ever used? (NON-MEDICAL USE ONLY)"
 *
 * New Design: Card-based with mandatory Yes/No buttons per substance
 * - All 10 substances must be answered
 * - Yes = user has used this substance (lifetime)
 * - No = user has never used this substance
 */

const SUBSTANCES = [
  {
    id: 'tobacco',
    name: 'Tobacco Products',
    description: 'Cigarettes, e-cigarettes, chewing tobacco, cigars, pipes',
    icon: '🚬'
  },
  {
    id: 'alcohol',
    name: 'Alcoholic Beverages',
    description: 'Beer, wine, spirits, palm wine, local brews',
    icon: '🍺'
  },
  {
    id: 'cannabis',
    name: 'Cannabis',
    description: 'Marijuana, weed, pot, grass, hashish, igbo',
    icon: '🌿'
  },
  {
    id: 'cocaine',
    name: 'Cocaine',
    description: 'Coke, crack, blow',
    icon: '💎'
  },
  {
    id: 'amphetamines',
    name: 'Amphetamine-type Stimulants',
    description: 'Speed, ecstasy, MDMA, methamphetamine',
    icon: '⚡'
  },
  {
    id: 'inhalants',
    name: 'Inhalants',
    description: 'Nitrous, glue, petrol, paint thinner, poppers',
    icon: '💨'
  },
  {
    id: 'sedatives',
    name: 'Sedatives or Sleeping Pills',
    description: 'Valium, Xanax, Rohypnol, benzodiazepines',
    icon: '💊'
  },
  {
    id: 'hallucinogens',
    name: 'Hallucinogens',
    description: 'LSD, acid, mushrooms, ketamine, PCP',
    icon: '🍄'
  },
  {
    id: 'opioids',
    name: 'Opioids',
    description: 'Heroin, morphine, codeine, tramadol, fentanyl',
    icon: '💉'
  },
  {
    id: 'other',
    name: 'Other Substances',
    description: 'Any other drug not listed above',
    icon: '❓'
  }
]

const ASSISTQ1 = ({ question, onComplete, onBack, initialData = null }) => {
  // Initialize responses with existing data or empty object
  const [responses, setResponses] = useState(() => {
    if (initialData?.lifetime_use) {
      // Convert legacy format to new format (all substances tracked)
      const converted = {}
      SUBSTANCES.forEach(sub => {
        if (initialData.lifetime_use[sub.id] === true) {
          converted[sub.id] = 'yes'
        } else if (initialData.lifetime_use[sub.id] === false) {
          // Explicit false means user selected "No" - preserve it!
          converted[sub.id] = 'no'
        }
        // undefined stays undefined (user hasn't answered yet)
      })
      return converted
    }
    return {}
  })

  const [otherSpecify, setOtherSpecify] = useState(initialData?.other_specify || '')

  // Handle Yes/No selection for a substance
  const handleResponse = (substanceId, value) => {
    setResponses(prev => ({
      ...prev,
      [substanceId]: value
    }))

    // Clear other specify if "other" is set to "no"
    if (substanceId === 'other' && value === 'no') {
      setOtherSpecify('')
    }
  }

  // Check if all substances have been answered
  const allAnswered = SUBSTANCES.every(sub => responses[sub.id] !== undefined)
  const answeredCount = SUBSTANCES.filter(sub => responses[sub.id] !== undefined).length
  const yesCount = SUBSTANCES.filter(sub => responses[sub.id] === 'yes').length

  // Validate and proceed
  const handleContinue = () => {
    if (!allAnswered) {
      alert('Please answer Yes or No for all substances before continuing.')
      return
    }

    // If "other" is yes, must specify
    if (responses.other === 'yes' && !otherSpecify.trim()) {
      alert('Please specify which other substance you have used.')
      return
    }

    // Convert to legacy format for compatibility with flow
    const lifetimeUse = {}
    SUBSTANCES.forEach(sub => {
      lifetimeUse[sub.id] = responses[sub.id] === 'yes'
    })

    onComplete({
      lifetime_use: lifetimeUse,
      other_specify: otherSpecify.trim() || null
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              ASSIST Screening - Question 1
            </span>
            <span className="text-sm text-white/80">
              {answeredCount} of {SUBSTANCES.length} answered
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {question?.question_text || 'In your life, which of the following substances have you ever used?'}
          </h2>
          <p className="text-white/90 mt-2 text-sm">
            (Non-medical use only - please answer Yes or No for each)
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / SUBSTANCES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Substance Cards */}
        <div className="p-4 sm:p-6 space-y-3">
          {SUBSTANCES.map((substance) => (
            <div key={substance.id}>
              <div
                className={`
                  border-2 rounded-xl p-4 transition-all
                  ${responses[substance.id] === 'yes'
                    ? ''
                    : responses[substance.id] === 'no'
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 hover:border-purple/50'}
                `}
                style={responses[substance.id] === 'yes' ? { borderColor: '#75DFE1', backgroundColor: 'rgba(117, 223, 225, 0.1)' } : {}}
              >
                <div className="flex items-start gap-4">
                  {/* Icon and Info */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {substance.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Substance Name and Description */}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {substance.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {substance.description}
                        </p>
                      </div>

                      {/* Yes/No Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleResponse(substance.id, 'yes')}
                          className={`
                            px-5 py-2 rounded-lg font-semibold text-sm transition-all
                            ${responses[substance.id] === 'yes'
                              ? 'text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                          `}
                          style={responses[substance.id] === 'yes' ? { backgroundColor: '#124A66' } : {}}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleResponse(substance.id, 'no')}
                          className={`
                            px-5 py-2 rounded-lg font-semibold text-sm transition-all
                            ${responses[substance.id] === 'no'
                              ? 'bg-gray-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                          `}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other substance specify input */}
                {substance.id === 'other' && responses.other === 'yes' && (
                  <div className="mt-4 ml-16">
                    <input
                      type="text"
                      value={otherSpecify}
                      onChange={(e) => setOtherSpecify(e.target.value)}
                      placeholder="e.g., Khat, Tramadol (separate multiple with commas)"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple focus:outline-none focus:ring-2 focus:ring-purple/20 transition-colors"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can enter multiple substances separated by commas
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {yesCount > 0 && allAnswered && (
          <div className="mx-4 sm:mx-6 mb-4 p-4 bg-blue/5 border border-blue/20 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Summary:</strong> You indicated using{' '}
              <span className="text-purple font-semibold">{yesCount}</span>{' '}
              substance{yesCount !== 1 ? 's' : ''} in your lifetime.
              {yesCount > 0 && ' The next questions will ask about your recent use.'}
            </p>
          </div>
        )}

        {/* Info Note */}
        <div className="mx-4 sm:mx-6 mb-6 p-4 bg-yellow/10 border border-yellow/30 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This screening focuses on non-medical use of substances.
            If you take prescription medications exactly as directed by a doctor, answer "No" for those.
          </p>
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
              className={`
                px-8 py-3 font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2
                ${allAnswered
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

ASSISTQ1.propTypes = {
  question: PropTypes.shape({
    question_text: PropTypes.string,
    options: PropTypes.object
  }),
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  initialData: PropTypes.shape({
    lifetime_use: PropTypes.object,
    other_specify: PropTypes.string
  })
}

export default ASSISTQ1