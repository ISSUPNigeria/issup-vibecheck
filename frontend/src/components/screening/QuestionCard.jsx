function QuestionCard({ question, answer, onAnswerChange }) {
  const { question_text, options, question_type, category } = question

  const categoryColors = {
    substance_use: 'border-red',
    mental_health: 'border-red',
    trauma: 'border-red',
    physical: 'border-red',
    crisis: 'border-red'
  }

  const categoryLabels = {
    substance_use: 'Substance Use',
    mental_health: 'Mental Health',
    trauma: 'Trauma',
    physical: 'Physical Health',
    crisis: 'Crisis Assessment'
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-t-4 ${categoryColors[category]} animate-fade-in`}>
      {/* Category Badge */}
      <div className="mb-3 sm:mb-4">
        <span className="inline-block bg-red/10 text-red text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
          {categoryLabels[category]}
        </span>
      </div>

      {/* Question Text */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
        {question_text}
      </h2>

      {/* Answer Options */}
      <div className="space-y-2 sm:space-y-3">
        {options && options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerChange(option)}
            className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 min-h-[48px] ${
              answer === option
                ? 'border-red bg-red/5 shadow-md'
                : 'border-gray-200 hover:border-red/50 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center flex-shrink-0 ${
                answer === option
                  ? 'border-red bg-red'
                  : 'border-gray-300'
              }`}>
                {answer === option && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`font-medium text-sm sm:text-base ${answer === option ? 'text-red' : 'text-gray-700'}`}>
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuestionCard
