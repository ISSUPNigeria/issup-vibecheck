import PropTypes from 'prop-types'

/**
 * PHQ-9 Results Summary
 *
 * Simple, clean display of PHQ-9 results matching ASSIST style.
 */
const PHQ9ResultsSummary = ({ results, onContinue, isFinal = false }) => {
  const {
    total_score = 0,
    severity,
    suicidal_ideation
  } = results || {}

  const getSeverityInfo = (level, score) => {
    // Special case: score of 0 means no symptoms at all
    if (score === 0) {
      return {
        bg: 'bg-green/10',
        border: 'border-green',
        text: 'text-green',
        badge: 'bg-green text-white',
        label: 'No Symptoms',
        recommendation: 'Keep taking care of yourself'
      }
    }

    switch (level?.toLowerCase()) {
      case 'severe':
        return {
          bg: 'bg-red/10',
          border: 'border-red',
          text: 'text-red',
          badge: 'bg-red text-white',
          label: 'Severe',
          recommendation: 'Professional support strongly recommended'
        }
      case 'moderately_severe':
        return {
          bg: 'bg-red/10',
          border: 'border-red',
          text: 'text-red',
          badge: 'bg-red text-white',
          label: 'Moderately Severe',
          recommendation: 'Active treatment recommended'
        }
      case 'moderate':
        return {
          bg: 'bg-orange/10',
          border: 'border-orange',
          text: 'text-orange',
          badge: 'bg-orange text-white',
          label: 'Moderate',
          recommendation: 'Consider speaking with a professional'
        }
      case 'mild':
        return {
          bg: 'bg-yellow/10',
          border: 'border-yellow-500',
          text: 'text-yellow-600',
          badge: 'bg-yellow-500 text-white',
          label: 'Mild',
          recommendation: 'Monitor symptoms and practice self-care'
        }
      default:
        return {
          bg: 'bg-green/10',
          border: 'border-green',
          text: 'text-green',
          badge: 'bg-green text-white',
          label: 'Minimal',
          recommendation: 'Continue your healthy habits'
        }
    }
  }

  const severityInfo = getSeverityInfo(severity, total_score)

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Mental Health Results
          </h1>
          <p className="text-white/90 text-center mt-2 text-sm">
            PHQ-9 Depression Screening Complete
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Crisis Alert */}
          {/* {suicidal_ideation && (
            <div className="bg-red/10 border-2 border-red rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤝</span>
                <div className="flex-1">
                  <h3 className="font-bold text-red text-lg mb-2">
                    Immediate Support Available
                  </h3>
                  <p className="text-gray-700 text-sm mb-3">
                    You don&apos;t have to face this alone. Please reach out:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold">WhatsApp:</span>{' '}
                      <a href="https://wa.me/2348129378557" className="text-blue underline">+234 812 937 8557</a>
                    </p>
                    <p>
                      <span className="font-semibold">Call/WhatsApp:</span>{' '}
                      <a href="tel:+2347046526817" className="text-blue underline">+234 704 652 6817</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Main Severity Result */}
          <div className={`p-4 rounded-xl border-2 ${severityInfo.border} ${severityInfo.bg} mb-6`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-gray-600 mb-1">Depression Severity</p>
                <p className={`text-2xl font-bold ${severityInfo.text}`}>
                  {severityInfo.label}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Score: {total_score} out of 27
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${severityInfo.badge} font-semibold text-sm text-center`}>
                {severityInfo.recommendation}
              </div>
            </div>
          </div>

          {/* Simple Score Scale */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Minimal</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  total_score >= 20 ? 'bg-red' :
                  total_score >= 10 ? 'bg-orange' :
                  total_score >= 5 ? 'bg-yellow-500' :
                  'bg-green'
                }`}
                style={{ width: `${Math.min((total_score / 27) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>27</span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> The PHQ-9 is a screening tool, not a diagnostic instrument. Please discuss these results with a qualified healthcare professional.
            </p>
          </div>

          {/* Next Step CTA */}
          <div className="bg-gradient-to-r from-green/5 to-blue/5 border border-green/20 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Final Step</p>
                <p className="font-semibold text-gray-800">View Complete Results</p>
                <p className="text-sm text-gray-600 mt-1">
                  See your full screening summary and personalized resources
                </p>
              </div>
              <svg className="w-6 h-6 text-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-100">
          <div className="flex justify-end">
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 transition-all flex items-center gap-2"
            >
              {isFinal ? 'View Complete Results' : 'Continue'}
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

PHQ9ResultsSummary.propTypes = {
  results: PropTypes.shape({
    total_score: PropTypes.number,
    severity: PropTypes.string,
    suicidal_ideation: PropTypes.bool
  }),
  onContinue: PropTypes.func.isRequired,
  isFinal: PropTypes.bool
}

export default PHQ9ResultsSummary