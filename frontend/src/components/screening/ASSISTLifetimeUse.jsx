import { useState, useEffect } from 'react'

/**
 * ASSIST Q1: Lifetime Substance Use Selection
 *
 * WHO ASSIST V3.0 Question 1:
 * "In your life, which of the following substances have you ever used? (NON-MEDICAL USE ONLY)"
 *
 * Response options:
 * - No (0) / Yes (3)
 * - Substances: tobacco, alcohol, cannabis, cocaine, amphetamines, inhalants, sedatives, hallucinogens, opioids
 * - Other (specify)
 */
const ASSISTLifetimeUse = ({ question, onComplete, onBack, initialData = {} }) => {
  const [lifetimeUse, setLifetimeUse] = useState(initialData?.lifetime_use || {})
  const [otherSpecify, setOtherSpecify] = useState(initialData?.other_specify || '')
  const [showOtherInput, setShowOtherInput] = useState(false)

  // Extract substance list from question options
  const substances = question?.options?.substances || [
    'tobacco',
    'alcohol',
    'cannabis',
    'cocaine',
    'amphetamines',
    'inhalants',
    'sedatives',
    'hallucinogens',
    'opioids',
    'other'
  ]

  useEffect(() => {
    // Show other input if 'other' is selected
    if (lifetimeUse.other) {
      setShowOtherInput(true)
    }
  }, [lifetimeUse])

  const handleSubstanceToggle = (substance) => {
    setLifetimeUse(prev => {
      const newState = { ...prev }

      if (newState[substance]) {
        // Deselecting substance
        delete newState[substance]

        // If deselecting 'other', clear the specify field
        if (substance === 'other') {
          setOtherSpecify('')
          setShowOtherInput(false)
        }
      } else {
        // Selecting substance
        newState[substance] = true

        // If selecting 'other', show input field
        if (substance === 'other') {
          setShowOtherInput(true)
        }
      }

      return newState
    })
  }

  const handleContinue = () => {
    // Validate: At least one substance selected
    const selectedSubstances = Object.keys(lifetimeUse).filter(sub => lifetimeUse[sub])

    if (selectedSubstances.length === 0) {
      alert('Please select at least one substance, or select "None" if you have never used any.')
      return
    }

    // Validate: If 'other' is selected, must specify
    if (lifetimeUse.other && !otherSpecify.trim()) {
      alert('Please specify which other substance you have used.')
      return
    }

    // Return response data
    onComplete({
      lifetime_use: lifetimeUse,
      other_specify: otherSpecify.trim() || null
    })
  }

  const formatSubstanceName = (substance) => {
    const names = {
      tobacco: 'Tobacco products (cigarettes, e-cigarettes, chewing tobacco)',
      alcohol: 'Alcoholic beverages (beer, wine, spirits)',
      cannabis: 'Cannabis (marijuana, weed, pot, grass)',
      cocaine: 'Cocaine (coke, crack)',
      amphetamines: 'Amphetamine-type stimulants (speed, ecstasy, MDMA)',
      inhalants: 'Inhalants (nitrous, glue, petrol, paint thinner)',
      sedatives: 'Sedatives or sleeping pills (Valium, Xanax, Rohypnol)',
      hallucinogens: 'Hallucinogens (LSD, acid, mushrooms)',
      opioids: 'Opioids (heroin, morphine, codeine, tramadol)',
      other: 'Other substances (please specify)'
    }
    return names[substance] || substance
  }

  const selectedCount = Object.keys(lifetimeUse).filter(sub => lifetimeUse[sub]).length

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-purple uppercase tracking-wide">
              ASSIST Screening - Question 1
            </span>
            {selectedCount > 0 && (
              <span className="text-sm text-gray-600">
                {selectedCount} selected
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {question?.question_text || 'In your life, which of the following substances have you ever used?'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            (NON-MEDICAL USE ONLY - Select all that apply)
          </p>
        </div>

        {/* Substance Checkboxes */}
        <div className="space-y-3 mb-6">
          {substances.map((substance) => (
            <div key={substance}>
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple hover:bg-purple-50 group ${
                  lifetimeUse[substance] ? '' : ''
                }`}
                style={lifetimeUse[substance] ? { borderColor: '#75DFE1', backgroundColor: 'rgba(117, 223, 225, 0.1)' } : {}}
              >
                <input
                  type="checkbox"
                  checked={lifetimeUse[substance] || false}
                  onChange={() => handleSubstanceToggle(substance)}
                  className="mt-1 h-5 w-5 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                  style={{ accentColor: '#124A66' }}
                />
                <span className="ml-3 flex-1">
                  <span className="block font-medium text-gray-900 group-hover:text-purple transition-colors">
                    {formatSubstanceName(substance)}
                  </span>
                </span>
              </label>

              {/* Other substance specify input */}
              {substance === 'other' && showOtherInput && lifetimeUse.other && (
                <div className="ml-12 mt-2 animate-slide-down">
                  <input
                    type="text"
                    value={otherSpecify}
                    onChange={(e) => setOtherSpecify(e.target.value)}
                    placeholder="Please specify which substance..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ '--tw-ring-color': '#75DFE1' }}
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border-l-4 border-blue p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This screening focuses on non-medical use of substances.
            If you take prescription medications as directed by a doctor, do not include them here.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all w-full sm:w-auto"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={selectedCount === 0}
            className="px-8 py-3 bg-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto sm:ml-auto"
          >
            Continue to Next Questions
          </button>
        </div>
      </div>
    </div>
  )
}

export default ASSISTLifetimeUse