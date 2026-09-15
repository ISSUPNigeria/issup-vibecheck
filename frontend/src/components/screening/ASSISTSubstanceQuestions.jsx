import { useState, useEffect } from 'react'

/**
 * ASSIST Q2-Q7: Per-Substance Questions
 *
 * WHO ASSIST V3.0 Questions 2-7 asked FOR EACH substance selected in Q1:
 * Q2: Frequency of use (past 3 months) - 0,2,3,4
 * Q3: Strong desire/urge to use (past 3 months) - 0,3,4,5,6
 * Q4: Health, social, legal, financial problems (past 3 months) - 0,4,5,6,7
 * Q5: Failed to do what was expected (past 3 months) - 0,5,6,7,8 [SKIP FOR TOBACCO]
 * Q6: Friend/relative/healthcare worker concerned (ever) - 0,6 (No=0, Yes but not past 3mo=3, Yes past 3mo=6)
 * Q7: Tried to control/cut down/stop (ever) - 0,3 (No=0, Yes but not past 3mo=1, Yes past 3mo=3)
 */
const ASSISTSubstanceQuestions = ({ questions, selectedSubstances, onComplete, onBack, initialData = {} }) => {
  // Initialize responses for each substance
  const [substanceResponses, setSubstanceResponses] = useState(initialData || {})
  const [currentSubstanceIndex, setCurrentSubstanceIndex] = useState(0)

  // Get list of substances to assess (excluding 'other' - it's handled separately)
  const substancesToAssess = selectedSubstances.filter(sub => sub !== 'other')
  const currentSubstance = substancesToAssess[currentSubstanceIndex]

  // Organize questions by question number FOR THE CURRENT SUBSTANCE
  // Filter questions to only those matching the current substance category
  const questionsByNumber = {}
  questions.forEach(q => {
    if (q.category === currentSubstance) {
      questionsByNumber[q.question_number] = q
    }
  })

  // Initialize current substance responses if not exist
  useEffect(() => {
    if (currentSubstance && !substanceResponses[currentSubstance]) {
      setSubstanceResponses(prev => ({
        ...prev,
        [currentSubstance]: {}
      }))
    }
  }, [currentSubstance])

  const handleResponseChange = (questionNumber, value) => {
    setSubstanceResponses(prev => ({
      ...prev,
      [currentSubstance]: {
        ...prev[currentSubstance],
        [questionNumber]: parseInt(value)
      }
    }))
  }

  const getCurrentResponses = () => {
    return substanceResponses[currentSubstance] || {}
  }

  const isQuestionAnswered = (questionNumber) => {
    const responses = getCurrentResponses()
    return responses[questionNumber] !== undefined
  }

  const canContinue = () => {
    const responses = getCurrentResponses()

    // Check Q2-Q4 (required for all substances)
    if (!isQuestionAnswered(2) || !isQuestionAnswered(3) || !isQuestionAnswered(4)) {
      return false
    }

    // Q5 is skipped for tobacco
    if (currentSubstance !== 'tobacco' && !isQuestionAnswered(5)) {
      return false
    }

    // Check Q6-Q7
    if (!isQuestionAnswered(6) || !isQuestionAnswered(7)) {
      return false
    }

    return true
  }

  const handleNext = () => {
    if (!canContinue()) {
      alert('Please answer all questions before continuing.')
      return
    }

    // Move to next substance or finish
    if (currentSubstanceIndex < substancesToAssess.length - 1) {
      setCurrentSubstanceIndex(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // All substances completed
      onComplete(substanceResponses)
    }
  }

  const handleBack = () => {
    if (currentSubstanceIndex > 0) {
      // Navigate to previous substance
      setCurrentSubstanceIndex(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (onBack) {
      // On first substance, go back to ASSIST Q1 (lifetime use)
      onBack()
    }
  }

  const formatSubstanceName = (substance) => {
    const names = {
      tobacco: 'Tobacco',
      alcohol: 'Alcohol',
      cannabis: 'Cannabis',
      cocaine: 'Cocaine',
      amphetamines: 'Amphetamines',
      inhalants: 'Inhalants',
      sedatives: 'Sedatives',
      hallucinogens: 'Hallucinogens',
      opioids: 'Opioids'
    }
    return names[substance] || substance
  }

  const renderQuestionOptions = (question) => {
    const responses = getCurrentResponses()
    const currentValue = responses[question.question_number]

    return (
      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <label
            key={idx}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple hover:bg-purple-50 group ${
              currentValue === option.score ? '' : 'border-gray-200'
            }`}
            style={currentValue === option.score ? { borderColor: '#75DFE1', backgroundColor: 'rgba(117, 223, 225, 0.1)' } : {}}
          >
            <input
              type="radio"
              name={`q${question.question_number}_${currentSubstance}`}
              value={option.score}
              checked={currentValue === option.score}
              onChange={(e) => handleResponseChange(question.question_number, e.target.value)}
              className="mt-1 h-5 w-5 border-gray-300 focus:ring-2 focus:ring-offset-2"
              style={{ accentColor: '#124A66' }}
            />
            <span className="ml-3 flex-1 text-gray-800 group-hover:text-purple transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    )
  }

  if (substancesToAssess.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No substances selected for assessment.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-fade-in">
        {/* Progress Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-purple uppercase tracking-wide">
              ASSIST Screening - Questions 2-7
            </span>
            <span className="text-sm text-gray-600">
              Substance {currentSubstanceIndex + 1} of {substancesToAssess.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: '#124A66', width: `${((currentSubstanceIndex + 1) / substancesToAssess.length) * 100}%` }}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Questions about <span style={{ color: '#124A66' }}>{formatSubstanceName(currentSubstance)}</span>
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Please answer the following questions about your {formatSubstanceName(currentSubstance).toLowerCase()} use.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {/* Q2: Frequency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {questionsByNumber[2]?.question_text.replace('[substance]', formatSubstanceName(currentSubstance).toLowerCase())}
            </h3>
            {renderQuestionOptions(questionsByNumber[2])}
          </div>

          {/* Q3: Strong desire */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {questionsByNumber[3]?.question_text.replace('[substance]', formatSubstanceName(currentSubstance).toLowerCase())}
            </h3>
            {renderQuestionOptions(questionsByNumber[3])}
          </div>

          {/* Q4: Problems */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {questionsByNumber[4]?.question_text.replace('[substance]', formatSubstanceName(currentSubstance).toLowerCase())}
            </h3>
            {renderQuestionOptions(questionsByNumber[4])}
          </div>

          {/* Q5: Failed expectations (SKIP FOR TOBACCO) */}
          {currentSubstance !== 'tobacco' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {questionsByNumber[5]?.question_text.replace('[substance]', formatSubstanceName(currentSubstance).toLowerCase())}
              </h3>
              {renderQuestionOptions(questionsByNumber[5])}
            </div>
          )}

          {/* Q6: Concern from others */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {questionsByNumber[6]?.question_text.replace('[substance]', formatSubstanceName(currentSubstance).toLowerCase())}
            </h3>
            {renderQuestionOptions(questionsByNumber[6])}
          </div>

          {/* Q7: Tried to control */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {questionsByNumber[7]?.question_text.replace('[substance]', formatSubstanceName(currentSubstance).toLowerCase())}
            </h3>
            {renderQuestionOptions(questionsByNumber[7])}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all w-full sm:w-auto"
          >
            {currentSubstanceIndex === 0 ? '← Back to Q1' : '← Previous Substance'}
          </button>

          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className="px-8 py-3 bg-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {currentSubstanceIndex < substancesToAssess.length - 1 ? 'Next Substance →' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ASSISTSubstanceQuestions