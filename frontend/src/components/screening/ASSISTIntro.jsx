import PropTypes from 'prop-types'

/**
 * ASSIST Introduction Screen
 *
 * Displays the WHO ASSIST introduction text before beginning the assessment.
 * This helps set expectations and ensures informed consent.
 */
const ASSISTIntro = ({ onContinue, onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Substance Use Screening
          </h1>
          <p className="text-white/90 text-center mt-2 text-sm sm:text-base">
            WHO ASSIST V3.0 Assessment
          </p>
        </div>

        {/* Introduction Text */}
        <div className="p-6 sm:p-8">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Thank you for agreeing to take part in this brief interview about alcohol, tobacco products and other drugs.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              I am going to ask you some questions about your experience of using these substances across your lifetime and in the past three months. These substances can be smoked, swallowed, snorted, inhaled, injected or taken in the form of pills.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue p-4 my-6 rounded-r-lg">
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong className="text-blue">Important Note:</strong> Some of the substances listed may be prescribed by a doctor (like amphetamines, sedatives, pain medications). For this interview, we will not record medications that are used as prescribed by your doctor. However, if you have taken such medications for reasons other than prescription, or taken them more frequently or at higher doses than prescribed, please let me know.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green p-4 my-6 rounded-r-lg">
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong className="text-green">Confidentiality:</strong> While we are also interested in knowing about your use of various illicit drugs, please be assured that information on such use will be treated as strictly confidential.
              </p>
            </div>
          </div>

          {/* What to Expect */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What to Expect</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple font-bold">1</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Lifetime Use</strong><br />
                  Which substances have you ever tried?
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple font-bold">2-7</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Recent Use</strong><br />
                  Details about the past 3 months
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue font-bold">8</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Injection Use</strong><br />
                  Have you ever injected?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-100">
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onContinue}
              className="w-full sm:w-auto px-8 py-3 bg-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 transition-all sm:ml-auto flex items-center justify-center gap-2"
            >
              Begin Assessment
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

ASSISTIntro.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onBack: PropTypes.func
}

export default ASSISTIntro