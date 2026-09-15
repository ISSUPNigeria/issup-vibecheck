import { useState } from 'react'
import { EXTERNAL_TRIGGER_LABELS, RATING_OPTIONS, formatTriggerName } from '../../utils/triggerLabels'

/**
 * External Triggers Screening (Step 1 of Triggers)
 *
 * WHO ERS 2A/2B: 39 situational triggers displayed in a responsive grid.
 * Users check applicable triggers, which expand to show 4-level rating radios.
 * No verdicts shown during assessment (displayed only on Results page).
 */

const triggerIds = Object.keys(EXTERNAL_TRIGGER_LABELS)

// Selected button colors (background + text for good contrast)
const RATING_COLORS = {
  0: { selectedBg: 'bg-emerald-600', selectedText: 'text-white', cardBg: 'bg-emerald-50', cardBorder: 'border-emerald-400' },
  1: { selectedBg: 'bg-amber-500', selectedText: 'text-gray-900', cardBg: 'bg-amber-50', cardBorder: 'border-amber-400' },
  2: { selectedBg: 'bg-orange', selectedText: 'text-white', cardBg: 'bg-orange/10', cardBorder: 'border-orange' },
  3: { selectedBg: 'bg-rose-600', selectedText: 'text-white', cardBg: 'bg-rose-50', cardBorder: 'border-rose-400' },
}

const ExternalTriggersScreening = ({ onComplete, onBack, initialData = {} }) => {
  // ratings: { trigger_id: 0|1|2|3 }
  const [ratings, setRatings] = useState(initialData?.external_ratings || {})
  const [customTriggers, setCustomTriggers] = useState(
    initialData?.external_custom?.join(', ') || ''
  )
  const [showCustom, setShowCustom] = useState(!!initialData?.external_custom?.length)

  const checkedTriggers = Object.keys(ratings)
  const checkedCount = checkedTriggers.length

  // All checked triggers must have a valid rating (0-3) to proceed
  const allRated = checkedCount > 0 && checkedTriggers.every(id => ratings[id] !== undefined)

  const handleToggle = (triggerId) => {
    setRatings(prev => {
      const next = { ...prev }
      if (triggerId in next) {
        delete next[triggerId]
      } else {
        // Default to no rating yet — will be set via radio
        next[triggerId] = undefined
      }
      return next
    })
  }

  const handleRate = (triggerId, value) => {
    setRatings(prev => ({ ...prev, [triggerId]: value }))
  }

  const handleContinue = () => {
    if (checkedCount === 0) {
      const skip = window.confirm(
        'You haven\'t selected any external triggers. Would you like to skip? Press OK to skip or Cancel to go back.'
      )
      if (!skip) return
    }

    // Build clean ratings dict (only triggers with a valid rating)
    const cleanRatings = {}
    for (const [id, val] of Object.entries(ratings)) {
      if (val !== undefined) {
        cleanRatings[id] = val
      }
    }

    const customList = customTriggers
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    onComplete({
      external_ratings: cleanRatings,
      external_custom: customList,
    })
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
              Triggers Assessment — Part 1 of 2
            </span>
            {checkedCount > 0 && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                {checkedCount} selected
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            External Triggers — Situations & Settings
          </h2>
          <p className="text-white/80 text-sm mt-2 max-w-2xl">
            Check each situation that has been associated with your substance use,
            then rate how likely you are to use in that situation.
          </p>
        </div>

        {/* Instruction */}
        <div className="px-4 sm:px-6 pt-5 pb-2">
          <p className="text-gray-600 text-sm">
            Tap a trigger to select it, then choose a "Chance of Use" rating. You can select as many as apply.
          </p>
        </div>

        {/* Grid of triggers */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {triggerIds.map((triggerId) => {
            const isChecked = triggerId in ratings
            const ratingValue = ratings[triggerId]
            const hasRating = ratingValue !== undefined
            const colorSet = hasRating ? RATING_COLORS[ratingValue] : null

            return (
              <div
                key={triggerId}
                className={`
                  border-2 rounded-xl transition-all overflow-hidden
                  ${isChecked && hasRating
                    ? `${colorSet.cardBorder} ${colorSet.cardBg}`
                    : isChecked
                      ? 'border-purple bg-purple/5'
                      : 'border-gray-200 hover:border-purple/40'}
                `}
              >
                {/* Checkbox row */}
                <label className="flex items-center gap-3 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(triggerId)}
                    className="h-5 w-5 rounded border-gray-300 text-purple focus:ring-2 focus:ring-purple focus:ring-offset-1"
                  />
                  <span className="font-medium text-gray-900 text-sm leading-tight">
                    {formatTriggerName(triggerId)}
                  </span>
                </label>

                {/* Rating radios — shown when checked */}
                {isChecked && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 animate-slide-down">
                    <p className={`text-xs mb-2 font-medium ${!hasRating ? 'text-orange-600' : 'text-gray-500'}`}>
                      {!hasRating ? '⚠️ Select a rating:' : 'Chance of Use:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {RATING_OPTIONS.map((opt) => {
                        const isSelected = ratingValue === opt.value
                        const optColor = RATING_COLORS[opt.value]

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleRate(triggerId, opt.value)}
                            className={`
                              px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                              ${isSelected
                                ? `${optColor.selectedBg} ${optColor.selectedText} shadow-md`
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}
                            `}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Custom trigger */}
        <div className="px-4 sm:px-6 pb-4">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="text-purple hover:text-purple/80 text-sm font-medium"
            >
              + Add custom situations
            </button>
          ) : (
            <div className="animate-slide-down">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other situations (comma-separated):
              </label>
              <input
                type="text"
                value={customTriggers}
                onChange={(e) => setCustomTriggers(e.target.value)}
                placeholder="e.g. After exams, Family gatherings"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple focus:ring-offset-1 text-sm"
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mx-4 sm:mx-6 mb-4 p-4 bg-blue/5 border border-blue/20 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Select all situations that apply to you and rate each one.
            Your detailed results will be shown on the Results page after all assessments are complete.
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
              disabled={checkedCount > 0 && !allRated}
              className={`
                w-full sm:w-auto px-8 py-3 font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 sm:ml-auto
                ${checkedCount > 0 && !allRated
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple text-white hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2'}
              `}
            >
              Continue to Internal Triggers
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {checkedCount > 0 && !allRated && (
            <p className="text-xs text-orange-600 mt-2 text-right">
              Please rate all selected triggers before continuing.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExternalTriggersScreening