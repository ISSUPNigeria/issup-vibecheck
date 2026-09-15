import PropTypes from 'prop-types'

/**
 * ASSIST Results Summary
 *
 * Displays intermediate results after completing the ASSIST assessment.
 * Shows per-substance risk levels and overall risk.
 */
const ASSISTResultsSummary = ({ results, onContinue }) => {
  const { scores, overall_risk, injection_drug_use } = results || {}

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-red/10',
          border: 'border-red',
          text: 'text-red',
          badge: 'bg-red text-white'
        }
      case 'moderate':
        return {
          bg: 'bg-orange/10',
          border: 'border-orange',
          text: 'text-orange',
          badge: 'bg-orange text-white'
        }
      default:
        return {
          bg: 'bg-green/10',
          border: 'border-green',
          text: 'text-green',
          badge: 'bg-green text-white'
        }
    }
  }

  const getSubstanceIcon = (substance) => {
    const icons = {
      tobacco: '🚬',
      alcohol: '🍺',
      cannabis: '🌿',
      cocaine: '💊',
      amphetamines: '⚡',
      inhalants: '💨',
      sedatives: '💤',
      hallucinogens: '🍄',
      opioids: '💉',
      other: '❓'
    }
    // For custom substances (other_0, other_1, etc.), use pill icon
    if (substance.startsWith('other_')) {
      return '💊'
    }
    return icons[substance] || '•'
  }

  // Format substance name, using display_name for custom substances
  const formatSubstanceName = (substance, data) => {
    // If display_name is provided (for custom substances), use it
    if (data?.display_name && data.display_name !== substance) {
      return data.display_name.charAt(0).toUpperCase() + data.display_name.slice(1)
    }
    return substance.charAt(0).toUpperCase() + substance.slice(1).replace(/_/g, ' ')
  }

  const overallColors = getRiskColor(overall_risk)

  // Filter to only show substances with scores > 0
  const substancesWithScores = scores ? Object.entries(scores).filter(([_, data]) => data.score > 0) : []

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
            Substance Use Results
          </h1>
          <p className="text-white/90 text-center mt-2 text-sm">
            ASSIST Assessment Complete
          </p>
        </div>

        {/* Results Content */}
        <div className="p-6 sm:p-8">
          {substancesWithScores.length > 0 ? (
            <>
              {/* Overall Risk Badge - only show when substances were assessed */}
              <div className={`p-4 rounded-xl border-2 ${overallColors.border} ${overallColors.bg} mb-6`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Overall Risk Level</p>
                    <p className={`text-2xl font-bold ${overallColors.text}`}>
                      {overall_risk?.toUpperCase() || 'LOW'}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${overallColors.badge} font-semibold`}>
                    {overall_risk === 'high' ? 'Intensive Support Recommended' :
                     overall_risk === 'moderate' ? 'Brief Intervention Recommended' :
                     'No Intervention Needed'}
                  </div>
                </div>
              </div>

              {/* Per-Substance Results */}
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Substance-Specific Results</h3>
                {substancesWithScores.map(([substance, data]) => {
                  const colors = getRiskColor(data.risk_level)
                  return (
                    <div
                      key={substance}
                      className={`p-4 rounded-lg border ${colors.border} ${colors.bg} transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSubstanceIcon(substance)}</span>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {formatSubstanceName(substance, data)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {data.score}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                          {data.risk_level?.toUpperCase() || 'LOW'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            /* No substances selected - show prominent positive message */
            <div className="bg-green/10 border-2 border-green rounded-xl p-6 mb-6 text-center">
              <div className="w-16 h-16 bg-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-green mb-2">
                No Substance Use Concerns
              </p>
              <p className="text-gray-600">
                No substance use concerns identified in the past 3 months.
              </p>
            </div>
          )}

          {/* Injection Warning */}
          {injection_drug_use > 0 && (
            <div className="bg-red/5 border-2 border-red rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red">Injection Drug Use Indicated</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please discuss safer injection practices with a healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> These results are based on your self-reported responses and are intended for informational purposes only. They do not constitute a medical diagnosis. Please consult with a healthcare professional for proper evaluation and guidance.
            </p>
          </div>

          {/* Next Step CTA */}
          <div className="bg-gradient-to-r from-purple/5 to-blue/5 border border-purple/20 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎲</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Next Step</p>
                <p className="font-semibold text-gray-800">Gambling Screening</p>
                <p className="text-sm text-gray-600 mt-1">
                  A brief assessment of gambling patterns using the PGSI
                </p>
              </div>
              <svg className="w-6 h-6 text-purple flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full sm:w-auto px-8 py-3 bg-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
            >
              Continue
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

ASSISTResultsSummary.propTypes = {
  results: PropTypes.shape({
    scores: PropTypes.object,
    overall_risk: PropTypes.string,
    injection_drug_use: PropTypes.number
  }),
  onContinue: PropTypes.func.isRequired,
}

export default ASSISTResultsSummary