import { useState } from 'react'
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import { formatTriggerName, LEVEL_CONFIG } from '../../utils/triggerLabels'

// Icon mapping for colorblind accessibility
const LEVEL_ICONS = {
  warning: FaExclamationTriangle,
  exclamation: FaExclamationCircle,
  info: FaInfoCircle,
  check: FaCheckCircle,
}

/**
 * Triggers Results Summary
 *
 * Displayed after Internal Triggers and before PHQ-9.
 * Shows triggers grouped by risk level with verdicts in tabbed view.
 */

// Verdicts for each level
const EXTERNAL_VERDICTS = {
  always_use: 'Involvement in these situations is deciding to stay addicted. Avoid totally.',
  almost_always: 'These situations are high risk. Staying in these situations is extremely dangerous.',
  almost_never: 'These situations are low risk, but caution is needed.',
  never_use: 'These situations are safe.',
}

const INTERNAL_VERDICTS = {
  always_use: 'Persisting in these emotions is deciding to stay addicted. Avoid totally.',
  almost_always: 'These emotions are high risk.',
  almost_never: 'These emotions are low risk, but caution is needed.',
  never_use: 'These emotions are safe.',
}

// Map rating value (0-3) to level key
const RATING_TO_LEVEL = {
  0: 'never_use',
  1: 'almost_never',
  2: 'almost_always',
  3: 'always_use',
}

// Order for display (highest risk first)
const LEVEL_ORDER = ['always_use', 'almost_always', 'almost_never', 'never_use']

const TriggersResultsSummary = ({ triggersData, onContinue, onBack }) => {
  const { external_ratings = {}, internal_ratings = {} } = triggersData || {}
  const [activeTab, setActiveTab] = useState('external')

  // Group triggers by level
  const groupByLevel = (ratings) => {
    const groups = {
      always_use: [],
      almost_always: [],
      almost_never: [],
      never_use: [],
    }

    for (const [triggerId, rating] of Object.entries(ratings)) {
      const level = RATING_TO_LEVEL[rating]
      if (level && groups[level]) {
        groups[level].push(triggerId)
      }
    }

    return groups
  }

  const externalGroups = groupByLevel(external_ratings)
  const internalGroups = groupByLevel(internal_ratings)

  const externalCount = Object.keys(external_ratings).length
  const internalCount = Object.keys(internal_ratings).length
  const totalCount = externalCount + internalCount

  // Render a level group
  const renderLevelGroup = (level, triggers, verdicts) => {
    if (!triggers || triggers.length === 0) return null

    const config = LEVEL_CONFIG[level]
    const verdict = verdicts[level]
    const IconComponent = config.icon ? LEVEL_ICONS[config.icon] : null

    return (
      <div key={level} className={`border-2 ${config.borderClass} ${config.bgClass} rounded-lg p-4 sm:p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.badgeClass}`}>
            {IconComponent && <IconComponent className="w-3 h-3" />}
            {config.label.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            {triggers.length} trigger{triggers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {triggers.map((triggerId) => (
            <span
              key={triggerId}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${config.badgeClass}`}
            >
              {formatTriggerName(triggerId)}
            </span>
          ))}
        </div>
        <p className={`text-sm ${config.textClass} italic`}>{verdict}</p>
      </div>
    )
  }

  // Check if a group has any triggers
  const hasExternalTriggers = LEVEL_ORDER.some(level => externalGroups[level]?.length > 0)
  const hasInternalTriggers = LEVEL_ORDER.some(level => internalGroups[level]?.length > 0)

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-blue p-6 sm:p-8">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
            Triggers Assessment — Results
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
            Your Triggers Summary
          </h2>
          <p className="text-white/80 text-sm mt-2">
            Based on your responses, here are your identified triggers grouped by risk level.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-purple">{totalCount}</p>
              <p className="text-xs text-gray-600">Total Triggers</p>
            </div>
            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-blue">{externalCount}</p>
              <p className="text-xs text-gray-600">Situational</p>
            </div>
            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-purple">{internalCount}</p>
              <p className="text-xs text-gray-600">Emotional</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {totalCount > 0 && (
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('external')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === 'external'
                    ? 'text-blue border-b-2 border-blue bg-blue/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">🏢</span>
                  External Triggers
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'external' ? 'bg-blue text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {externalCount}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('internal')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === 'internal'
                    ? 'text-purple border-b-2 border-purple bg-purple/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">💭</span>
                  Internal Triggers
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'internal' ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {internalCount}
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* External Triggers Tab */}
          {activeTab === 'external' && (
            <div className="space-y-4 animate-fade-in">
              {hasExternalTriggers ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    These are situations and settings that may trigger substance use.
                  </p>
                  {LEVEL_ORDER.map((level) =>
                    renderLevelGroup(level, externalGroups[level], EXTERNAL_VERDICTS)
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No external triggers were selected.</p>
                </div>
              )}
            </div>
          )}

          {/* Internal Triggers Tab */}
          {activeTab === 'internal' && (
            <div className="space-y-4 animate-fade-in">
              {hasInternalTriggers ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    These are emotions and feelings that may trigger substance use.
                  </p>
                  {LEVEL_ORDER.map((level) =>
                    renderLevelGroup(level, internalGroups[level], INTERNAL_VERDICTS)
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No internal triggers were selected.</p>
                </div>
              )}
            </div>
          )}

          {/* No triggers at all */}
          {totalCount === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No triggers were selected during the assessment.</p>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mx-4 sm:mx-6 mb-4 p-4 bg-purple/5 border border-purple/20 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Understanding your triggers</strong> is a crucial step in recovery.
            Focus on developing coping strategies for your high-risk triggers first.
            Your detailed results will also be available on the final Results page.
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
              onClick={onContinue}
              className="w-full sm:w-auto px-8 py-3 bg-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 transition-all flex items-center justify-center gap-2 sm:ml-auto"
            >
              Continue to Patient Health Questionnaire
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

export default TriggersResultsSummary