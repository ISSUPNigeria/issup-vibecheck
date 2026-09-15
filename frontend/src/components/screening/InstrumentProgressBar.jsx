import PropTypes from 'prop-types'

/**
 * Progress bar showing the 3 main screening instruments
 * ASSIST → Triggers → PHQ-9
 *
 * States:
 * - completed: Filled circle with checkmark
 * - current: Highlighted circle with pulse animation
 * - upcoming: Empty circle
 * - skipped: Gray circle with dash (for conditional triggers)
 */
const InstrumentProgressBar = ({
  currentInstrument,
  completedInstruments = [],
  showTriggers = true
}) => {
  const instruments = [
    {
      id: 'assist',
      name: 'Substance Use',
      shortName: 'ASSIST',
      icon: '🧪'
    },
    {
      id: 'pgsi',
      name: 'Gambling',
      shortName: 'PGSI',
      icon: '🎲'
    },
    {
      id: 'triggers',
      name: 'Triggers',
      shortName: 'Triggers',
      icon: '⚡',
      conditional: true
    },
    {
      id: 'phq9',
      name: 'Mental Health',
      shortName: 'PHQ-9',
      icon: '💭'
    }
  ]

  const getStatus = (instrumentId) => {
    if (completedInstruments.includes(instrumentId)) {
      return 'completed'
    }
    if (currentInstrument === instrumentId) {
      return 'current'
    }
    if (instrumentId === 'triggers' && !showTriggers) {
      return 'skipped'
    }
    return 'upcoming'
  }

  const getCircleStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green text-white border-green'
      case 'current':
        return 'bg-purple text-white border-purple animate-pulse'
      case 'skipped':
        return 'bg-gray-200 text-gray-400 border-gray-300'
      default:
        return 'bg-white text-gray-400 border-gray-300'
    }
  }

  const getLineStyles = (fromStatus, toStatus) => {
    if (fromStatus === 'completed') {
      return 'bg-green'
    }
    if (fromStatus === 'skipped' || toStatus === 'skipped') {
      return 'bg-gray-200'
    }
    return 'bg-gray-200'
  }

  const getTextStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green font-semibold'
      case 'current':
        return 'text-purple font-bold'
      case 'skipped':
        return 'text-gray-400'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 sm:p-6">
      {/* Desktop/Tablet View */}
      <div className="hidden sm:flex items-center justify-between">
        {instruments.map((instrument, index) => {
          const status = getStatus(instrument.id)
          const isLast = index === instruments.length - 1

          return (
            <div key={instrument.id} className="flex items-center flex-1">
              {/* Instrument Circle and Label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${getCircleStyles(status)}`}
                >
                  {status === 'completed' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === 'skipped' ? (
                    <span className="text-lg">—</span>
                  ) : (
                    <span className="text-xl">{instrument.icon}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${getTextStyles(status)}`}>
                    {instrument.shortName}
                  </p>
                  <p className="text-xs text-gray-400 hidden md:block">
                    {status === 'skipped' ? 'Skipped' : instrument.name}
                  </p>
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 mx-3 h-1 rounded-full transition-all duration-300">
                  <div
                    className={`h-full rounded-full ${getLineStyles(
                      status,
                      getStatus(instruments[index + 1].id)
                    )}`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="flex items-center justify-center space-x-2 mb-3">
          {instruments.map((instrument, index) => {
            const status = getStatus(instrument.id)
            const isLast = index === instruments.length - 1

            return (
              <div key={instrument.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getCircleStyles(status)}`}
                >
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === 'skipped' ? (
                    <span className="text-xs">—</span>
                  ) : (
                    <span className="text-sm">{instrument.icon}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={`w-8 h-0.5 ${getLineStyles(status, getStatus(instruments[index + 1].id))}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Current Instrument Name */}
        <div className="text-center">
          <p className="text-sm font-semibold text-purple">
            {instruments.find(i => i.id === currentInstrument)?.name || 'Screening'}
          </p>
        </div>
      </div>
    </div>
  )
}

InstrumentProgressBar.propTypes = {
  currentInstrument: PropTypes.oneOf(['assist', 'pgsi', 'triggers', 'phq9']).isRequired,
  completedInstruments: PropTypes.arrayOf(PropTypes.string),
  showTriggers: PropTypes.bool
}

export default InstrumentProgressBar
