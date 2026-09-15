import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaWhatsapp, FaPhoneAlt, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import Header from '../components/shared/Header'
import ResultsFeedback from '../components/shared/ResultsFeedback'
import { getValidatedResults, submitImprovementSuggestion } from '../services/api'
import { generateScreeningPDF } from '../utils/pdfGenerator'
import { formatTriggerName, LEVEL_CONFIG } from '../utils/triggerLabels'
import { NIGERIAN_HOSPITALS } from '../constants/hospitals'

function Results() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const fromHistory = searchParams.get('from') === 'history'

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [suggestion, setSuggestion] = useState('')
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false)
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }
    fetchResults()
  }, [sessionId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const data = await getValidatedResults(sessionId)
      setResults(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching results:', err)
      setError('Failed to load results. Please try again.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your responses...</p>
            <p className="text-sm text-gray-500 mt-2">Generating personalized feedback...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <div className="text-red text-5xl mb-4 text-center">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error</h2>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-purple text-white py-3 rounded-lg font-semibold hover:bg-purple/90 transition-colors focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { assist_results, pgsi_results, phq9_results, triggers_results, crisis_detected, ai_feedback } = results

  // Determine overall severity
  const getOverallSeverity = () => {
    if (crisis_detected) return 'immediate'
    if (phq9_results?.severity === 'severe' || phq9_results?.severity === 'moderately_severe') return 'high'
    if (assist_results?.overall_risk === 'high') return 'high'
    if (phq9_results?.severity === 'moderate' || assist_results?.overall_risk === 'moderate') return 'moderate'
    return 'low'
  }

  const overallSeverity = getOverallSeverity()

  const chatCardColors = {
    'low': {
      bg: 'bg-gradient-to-r from-green/5 to-green/10',
      border: 'border-green/20',
      icon: 'text-green',
      button: 'bg-green hover:bg-green/90'
    },
    'moderate': {
      bg: 'bg-gradient-to-r from-orange/5 to-orange/10',
      border: 'border-orange/20',
      icon: 'text-orange',
      button: 'bg-orange hover:bg-orange/90'
    },
    'high': {
      bg: 'bg-gradient-to-r from-red/5 to-red/10',
      border: 'border-red/20',
      icon: 'text-red',
      button: 'bg-red hover:bg-red/90'
    },
    'immediate': {
      bg: 'bg-gradient-to-r from-red/5 to-red/10',
      border: 'border-red/20',
      icon: 'text-red',
      button: 'bg-red hover:bg-red/90'
    }
  }

  const chatColors = chatCardColors[overallSeverity]

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'assist', label: 'Substance Use', icon: '💊' },
    { id: 'triggers', label: 'Triggers', icon: '⚡', show: triggers_results && triggers_results.total_triggers > 0 },
    { id: 'phq9', label: 'Mental Health', icon: '🧠' },
    { id: 'gambling', label: 'Gambling', icon: '🎲' },
    { id: 'next-steps', label: 'Next Steps', icon: '🎯' }
  ].filter(tab => tab.show !== false)

  // Get substance-specific harm information (shared with Results display)
  const getSubstanceHarms = (substanceName) => {
    const substanceHarms = {
      tobacco: {
        statement: "Regular tobacco smoking is associated with:",
        harms: [
          "Premature aging, wrinkling of the skin",
          "Respiratory infections and asthma",
          "High blood pressure, diabetes",
          "Respiratory infections, allergies and asthma in children of smokers",
          "Miscarriage, premature labour and low birth weight babies for pregnant women",
          "Kidney disease",
          "Chronic obstructive airways disease",
          "Heart disease, stroke, vascular disease",
          "Cancers"
        ]
      },
      alcohol: {
        statement: "Regular excessive alcohol use is associated with:",
        harms: [
          "Hangovers, aggressive and violent behaviour, accidents and injury",
          "Reduced sexual performance, premature ageing",
          "Digestive problems, ulcers, inflammation of the pancreas, high blood pressure",
          "Anxiety and depression, relationship difficulties, financial and work problems",
          "Difficulty remembering things and solving problems",
          "Deformities and brain damage in babies of pregnant women",
          "Stroke, permanent brain injury, muscle and nerve damage",
          "Liver disease, pancreas disease",
          "Cancers, suicide"
        ]
      },
      cannabis: {
        statement: "Regular use of cannabis is associated with:",
        harms: [
          "Problems with attention and motivation",
          "Anxiety, paranoia, panic, depression",
          "Decreased memory and problem solving ability",
          "High blood pressure",
          "Asthma, bronchitis",
          "Psychosis in those with a personal or family history of schizophrenia",
          "Heart disease and chronic obstructive airways disease",
          "Cancers"
        ]
      },
      cocaine: {
        statement: "Regular use of cocaine is associated with:",
        harms: [
          "Difficulty sleeping, heart racing, headaches, weight loss",
          "Numbness, tingling, clammy skin, skin scratching or picking",
          "Accidents and injury, financial problems",
          "Irrational thoughts",
          "Mood swings - anxiety, depression, mania",
          "Aggression and paranoia",
          "Intense craving, stress from the lifestyle",
          "Psychosis after repeated use of high doses",
          "Sudden death from heart problems"
        ]
      },
      amphetamines: {
        statement: "Regular use of amphetamine type stimulants is associated with:",
        harms: [
          "Difficulty sleeping, loss of appetite and weight loss, dehydration",
          "Jaw clenching, headaches, muscle pain",
          "Mood swings –anxiety, depression, agitation, mania, panic, paranoia",
          "Tremors, irregular heartbeat, shortness of breath",
          "Aggressive and violent behaviour",
          "Psychosis after repeated use of high doses",
          "Permanent damage to brain cells",
          "Liver damage, brain haemorrhage, sudden death (ecstasy) in rare situations"
        ]
      },
      inhalants: {
        statement: "Regular use of inhalants is associated with:",
        harms: [
          "Dizziness and hallucinations, drowsiness, disorientation, blurred vision",
          "Flu like symptoms, sinusitis, nosebleeds",
          "Indigestion, stomach ulcers",
          "Accidents and injury",
          "Memory loss, confusion, depression, aggression",
          "Coordination difficulties, slowed reactions, hypoxia",
          "Delirium, seizures, coma, organ damage (heart, lungs, liver, kidneys)",
          "Death from heart failure"
        ]
      },
      sedatives: {
        statement: "Regular use of sedatives is associated with:",
        harms: [
          "Drowsiness, dizziness and confusion",
          "Difficulty concentrating and remembering things",
          "Nausea, headaches, unsteady gait",
          "Sleeping problems",
          "Anxiety and depression",
          "Tolerance and dependence after a short period of use",
          "Severe withdrawal symptoms",
          "Overdose and death if used with alcohol, opioids or other depressant drugs"
        ]
      },
      hallucinogens: {
        statement: "Regular use of hallucinogens is associated with:",
        harms: [
          "Hallucinations (pleasant or unpleasant) – visual, auditory, tactile, olfactory",
          "Difficulty sleeping",
          "Nausea and vomiting",
          "Increased heart rate and blood pressure",
          "Mood swings",
          "Anxiety, panic, paranoia",
          "Flash-backs",
          "Increase the effects of mental illnesses such as schizophrenia"
        ]
      },
      opioids: {
        statement: "Regular use of opioids is associated with:",
        harms: [
          "Itching, nausea and vomiting",
          "Drowsiness",
          "Constipation, tooth decay",
          "Difficulty concentrating and remembering things",
          "Reduced sexual desire and sexual performance",
          "Relationship difficulties",
          "Financial and work problems, violations of law",
          "Tolerance and dependence, withdrawal symptoms",
          "Overdose and death from respiratory failure"
        ]
      },
      other: {
        statement: "Regular substance use may be associated with:",
        harms: [
          "Physical and mental health problems",
          "Tolerance and dependence over time",
          "Withdrawal symptoms when stopping",
          "Accidents and injury",
          "Relationship and social difficulties",
          "Financial and work problems",
          "The specific risks depend on the substance - please consult a healthcare provider for personalized guidance"
        ]
      }
    };

    const normalizedSubstance = substanceName.toLowerCase().replace(/_/g, '');
    const substanceKey = Object.keys(substanceHarms).find(key =>
      normalizedSubstance.includes(key.replace(/_/g, ''))
    ) || 'other';

    return substanceHarms[substanceKey] || substanceHarms.other;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Crisis Alert */}
        {crisis_detected && (
          <div className="bg-red border-l-4 border-red rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg animate-bounce-in">
            <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Immediate Support Available</h3>
                <p className="text-sm sm:text-base text-white mb-3 sm:mb-4">
                  Based on your responses, we strongly encourage you to reach out for immediate support.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  <a
                    href="https://wa.me/2348129378557"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-white text-green px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    <span>WhatsApp: +234 812 937 8557</span>
                  </a>
                  <a
                    href="https://wa.me/2349039890177"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-white text-green px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    <span>WhatsApp: +234 903 989 0177</span>
                  </a>
                  <a
                    href="tel:+2347046526817"
                    className="inline-flex items-center space-x-2 bg-white text-red px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <FaPhoneAlt className="w-5 h-5" />
                    <span>Call/WhatsApp: +234 704 652 6817</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Your Screening Results</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6">
            Review your assessment results across different areas. Each tab provides detailed insights and personalized feedback.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {/* Download PDF Button */}
            <button
              onClick={async () => await generateScreeningPDF(results)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-purple text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow-md hover:bg-purple/90 hover:shadow-lg transition-all text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Download PDF Report</span>
              <span className="sm:hidden">Download PDF</span>
            </button>

            {/* Chat with AI Support Button */}
            <button
              onClick={() => navigate(`/chat?session_id=${sessionId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-green text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow-md hover:bg-green/90 hover:shadow-lg transition-all text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="hidden sm:inline">{fromHistory ? 'Continue Conversation' : 'Chat with AI Support'}</span>
              <span className="sm:hidden">{fromHistory ? 'Continue' : 'Chat with AI'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl shadow-md border-b border-gray-200 mb-0" role="tablist" aria-label="Results sections">
          <div className="flex justify-between sm:justify-start sm:overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 font-medium sm:font-semibold whitespace-nowrap transition-all border-b-4 text-sm sm:text-base min-h-[48px] ${
                  activeTab === tab.id
                    ? 'border-purple text-purple bg-purple/5'
                    : 'border-transparent text-gray-600 hover:text-purple hover:bg-gray-50'
                }`}
              >
                <span className="text-lg sm:text-xl">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-md p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Assessment Overview</h2>

              {/* Overall AI Insight */}
              {ai_feedback?.overall_message && (
                <div className="bg-gradient-to-br from-purple/5 via-blue/5 to-green/5 rounded-lg border-2 border-purple/20 p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Personalized Insight</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{ai_feedback.overall_message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* ASSIST Summary */}
                {assist_results && (
                  <div className="bg-gradient-to-br from-orange/5 to-red/5 rounded-lg border-2 border-orange/20 p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <span className="text-2xl sm:text-3xl">💊</span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Substance Use</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Overall Risk Level</p>
                    <span className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                      assist_results.overall_risk === 'high' ? 'bg-red text-white' :
                      assist_results.overall_risk === 'moderate' ? 'bg-orange text-white' :
                      'bg-green text-white'
                    }`}>
                      {assist_results.overall_risk.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* PHQ-9 Summary */}
                {phq9_results && (
                  <div className="bg-gradient-to-br from-blue/5 to-purple/5 rounded-lg border-2 border-blue/20 p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <span className="text-2xl sm:text-3xl">🧠</span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Mental Health</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Depression Severity</p>
                    <span className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                      phq9_results.severity === 'severe' ? 'bg-red text-white' :
                      phq9_results.severity === 'moderately_severe' ? 'bg-orange text-white' :
                      phq9_results.severity === 'moderate' ? 'bg-orange text-white' :
                      phq9_results.severity === 'mild' ? 'bg-blue text-white' :
                      'bg-green text-white'
                    }`}>
                      {phq9_results.severity === 'moderately_severe' ? 'MODERATELY SEVERE' :
                       phq9_results.severity === 'severe' ? 'SEVERE' :
                       phq9_results.severity === 'moderate' ? 'MODERATE' :
                       phq9_results.severity === 'mild' ? 'MILD' :
                       'MINIMAL'}
                    </span>
                  </div>
                )}

                {/* Triggers Summary */}
                {triggers_results && triggers_results.total_triggers > 0 && (
                  <div className="bg-gradient-to-br from-purple/5 to-pink/5 rounded-lg border-2 border-purple/20 p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <span className="text-2xl sm:text-3xl">⚡</span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Triggers</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      {triggers_results.external_count} situational, {triggers_results.internal_count} emotional
                    </p>
                    <span className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                      triggers_results.highest_external_level === 'always_use' || triggers_results.highest_internal_level === 'always_use'
                        ? 'bg-red text-white'
                        : triggers_results.highest_external_level === 'almost_always' || triggers_results.highest_internal_level === 'almost_always'
                          ? 'bg-orange text-white'
                          : 'bg-purple text-white'
                    }`}>
                      {triggers_results.total_triggers} Triggers
                    </span>
                  </div>
                )}
              </div>

              {/* Chat with AI */}
              <div className={`${chatColors.bg} border-2 ${chatColors.border} rounded-xl shadow-md p-4 sm:p-6 mt-6 sm:mt-8`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center">
                      <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${chatColors.icon} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {fromHistory ? 'Continue Your Conversation' : 'Need Support? Chat with Our AI'}
                    </h3>
                    <p className="text-gray-600">
                      {fromHistory
                        ? 'Pick up where you left off — your previous messages are saved.'
                        : 'Get personalized guidance and discuss your results with our empathetic AI support bot'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/chat?session_id=${sessionId}`)}
                    className={`w-full sm:w-auto sm:ml-6 ${chatColors.button} text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 whitespace-nowrap`}
                  >
                    <span>{fromHistory ? 'Continue Chat' : 'Start Chat'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Feedback Section */}
              <ResultsFeedback
                sessionId={sessionId}
                tabName="overview"
                colorTheme="purple"
                tabContentSummary={{
                  tab: 'overview',
                  overall_severity: overallSeverity,
                  assist_risk: assist_results?.overall_risk || null,
                  phq9_severity: phq9_results?.severity || null,
                  triggers_count: triggers_results?.total_triggers || 0,
                  ai_overall_message_shown: !!ai_feedback?.overall_message
                }}
              />
            </div>
          )}

          {/* ASSIST Tab */}
          {activeTab === 'assist' && assist_results && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="md:text-3xl text-2xl font-bold text-gray-900">Substance Use Assessment (WHO ASSIST)</h2>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                  assist_results.overall_risk === 'high' ? 'bg-red text-white' :
                  assist_results.overall_risk === 'moderate' ? 'bg-orange text-white' :
                  'bg-green text-white'
                }`}>
                  {assist_results.overall_risk === 'high' && <FaExclamationTriangle className="w-3.5 h-3.5" />}
                  {assist_results.overall_risk === 'moderate' && <FaExclamationCircle className="w-3.5 h-3.5" />}
                  {assist_results.overall_risk === 'low' && <FaCheckCircle className="w-3.5 h-3.5" />}
                  {assist_results.overall_risk.charAt(0).toUpperCase() + assist_results.overall_risk.slice(1)}
                </span>
              </div>

              <p className="text-gray-700 mb-6">
                Overall substance use risk level: <strong>{assist_results.overall_risk}</strong>
                {assist_results.brief_intervention_needed && ' - Brief intervention recommended'}
              </p>

              {/* Substance-Specific Results */}
              {assist_results.scores && Object.keys(assist_results.scores).length > 0 && (
                <div className="space-y-6">
                  {Object.entries(assist_results.scores).map(([substance, score]) => {
                    const harmData = getSubstanceHarms(substance);

                    // For "other" substance, show the actual custom substance names
                    let displayName = substance.replace(/_/g, ' ');
                    let customSubstances = [];
                    if (substance === 'other' && assist_results.other_specify) {
                      customSubstances = assist_results.other_specify.split(',').map(s => s.trim()).filter(s => s);
                      displayName = customSubstances.length > 0
                        ? customSubstances.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
                        : 'Other Substances';
                    }

                    return (
                      <div key={substance} className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                        <div className="bg-gray-100 px-6 py-4 border-b-2 border-gray-200">
                          <h4 className="text-xl font-bold text-gray-900 capitalize">
                            {displayName}
                          </h4>
                          {substance === 'other' && customSubstances.length > 1 && (
                            <p className="text-sm text-gray-500 mt-1">Combined score for all custom substances</p>
                          )}
                        </div>

                        <div className="px-6 py-5 space-y-4">
                          <div>
                            <p className="text-base text-gray-700 mb-1">
                              <span className="font-semibold">Score:</span> <span className="text-2xl font-bold text-gray-900">{score.score}</span>
                            </p>
                            <p className="text-sm text-gray-500">{score.calculation}</p>
                          </div>

                          <div className={`p-4 rounded-lg text-center border-2 ${
                            score.risk_level === 'high' ? 'bg-red text-white border-red' :
                            score.risk_level === 'moderate' ? 'bg-orange text-white border-orange' :
                            'bg-green text-white border-green'
                          }`}>
                            <p className="text-sm font-semibold mb-1">Risk Level</p>
                            <p className="md:text-3xl text-2xl font-bold uppercase">{score.risk_level}</p>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                            <p className="text-base font-bold text-gray-900 mb-3">
                              Your risk of experiencing health and other problems from {displayName.toLowerCase()} use is:
                              <span className={`ml-2 uppercase ${
                                score.risk_level === 'high' ? 'text-red' :
                                score.risk_level === 'moderate' ? 'text-orange' :
                                'text-green'
                              }`}>
                                {score.risk_level}
                              </span>
                            </p>

                            <div>
                              <p className="text-base font-semibold text-gray-900 mb-2">
                                {harmData.statement}
                              </p>
                              <ul className="list-none space-y-1 pl-0">
                                {harmData.harms.map((harm, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                                    <span className="mr-2 text-gray-400 select-none">•</span>
                                    <span>{harm}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className={`p-4 rounded-lg border ${
                            score.risk_level === 'high' ? 'bg-red/10 border-red' :
                            score.risk_level === 'moderate' ? 'bg-orange/10 border-orange' :
                            'bg-green/10 border-green'
                          }`}>
                            <p className="font-semibold text-gray-900 mb-2">Recommendation:</p>
                            <p className="text-sm text-gray-700">
                              {score.risk_level === 'low' &&
                                'Continue current pattern and receive educational materials on substance use.'
                              }
                              {score.risk_level === 'moderate' &&
                                'Brief intervention recommended. Consider speaking with a healthcare professional about reducing your use and developing coping strategies.'
                              }
                              {score.risk_level === 'high' &&
                                'Intensive treatment recommended. Please seek professional assessment and consider treatment options. Early intervention can prevent serious health consequences.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {assist_results.injection_risk && (
                <div className="mt-6 p-4 bg-orange/10 border-l-4 border-orange rounded">
                  <p className="text-sm font-semibold text-orange">
                    Injection drug use detected ({assist_results.injection_timeframe})
                  </p>
                </div>
              )}

              {/* AI Insight for ASSIST */}
              {ai_feedback?.assist_feedback && (
                <div className="mt-8 bg-gradient-to-br from-orange/5 to-red/5 rounded-lg border-2 border-orange/20 p-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Substance Use Insights</h3>
                      <p className="text-gray-700 leading-relaxed">{ai_feedback.assist_feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              <ResultsFeedback
                sessionId={sessionId}
                tabName="assist"
                colorTheme="orange"
                tabContentSummary={{
                  tab: 'assist',
                  overall_risk: assist_results.overall_risk,
                  substances_assessed: Object.keys(assist_results.scores || {}),
                  scores: Object.fromEntries(
                    Object.entries(assist_results.scores || {}).map(([k, v]) => [k, v.score])
                  ),
                  injection_risk: assist_results.injection_risk || false,
                  ai_feedback_shown: !!ai_feedback?.assist_feedback
                }}
              />
            </div>
          )}

          {/* PHQ-9 Tab */}
          {activeTab === 'phq9' && phq9_results && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="md:text-3xl text-2xl font-bold text-gray-900">Depression Screening (PHQ-9)</h2>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                  phq9_results.severity === 'severe' ? 'bg-red text-white' :
                  phq9_results.severity === 'moderately_severe' ? 'bg-orange text-white' :
                  phq9_results.severity === 'moderate' ? 'bg-orange text-white' :
                  phq9_results.severity === 'mild' ? 'bg-blue text-white' :
                  'bg-green text-white'
                }`}>
                  {(phq9_results.severity === 'severe' || phq9_results.severity === 'moderately_severe') && <FaExclamationTriangle className="w-3.5 h-3.5" />}
                  {phq9_results.severity === 'moderate' && <FaExclamationCircle className="w-3.5 h-3.5" />}
                  {phq9_results.severity === 'mild' && <FaInfoCircle className="w-3.5 h-3.5" />}
                  {phq9_results.severity === 'minimal' && <FaCheckCircle className="w-3.5 h-3.5" />}
                  {phq9_results.severity === 'moderately_severe' ? 'Moderately Severe' :
                   phq9_results.severity === 'severe' ? 'Severe' :
                   phq9_results.severity === 'moderate' ? 'Moderate' :
                   phq9_results.severity === 'mild' ? 'Mild' :
                   'Minimal'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Total Score</span>
                  <span className="font-bold text-gray-900">{phq9_results.total_score} / 27</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ${
                      phq9_results.total_score >= 20 ? 'bg-red' :
                      phq9_results.total_score >= 15 ? 'bg-orange' :
                      phq9_results.total_score >= 10 ? 'bg-orange' :
                      phq9_results.total_score >= 5 ? 'bg-blue' :
                      'bg-green'
                    }`}
                    style={{ width: `${(phq9_results.total_score / 27) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {phq9_results.action_description}
                </p>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Functional Impairment:</strong> {phq9_results.functional_impairment.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {phq9_results.suicidal_ideation && (
                <div className="p-4 bg-red/10 border-l-4 border-red rounded">
                  <p className="text-sm font-semibold text-red-700">
                    ⚠️ Suicidal ideation detected - Please seek immediate support
                  </p>
                </div>
              )}

              {/* AI Insight for PHQ-9 */}
              {ai_feedback?.phq9_feedback && (
                <div className="mt-8 bg-gradient-to-br from-blue/5 to-purple/5 rounded-lg border-2 border-blue/20 p-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Mental Health Insights</h3>
                      <p className="text-gray-700 leading-relaxed">{ai_feedback.phq9_feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              <ResultsFeedback
                sessionId={sessionId}
                tabName="phq9"
                colorTheme="blue"
                tabContentSummary={{
                  tab: 'phq9',
                  total_score: phq9_results.total_score,
                  severity: phq9_results.severity,
                  suicidal_ideation: phq9_results.suicidal_ideation || false,
                  functional_impairment: phq9_results.functional_impairment,
                  ai_feedback_shown: !!ai_feedback?.phq9_feedback
                }}
              />
            </div>
          )}

          {/* Triggers Tab */}
          {activeTab === 'triggers' && triggers_results && (
            <div className="animate-fade-in space-y-6">
              <h2 className="md:text-3xl text-2xl font-bold text-gray-900 mb-6">Triggers Assessment</h2>

              {/* Summary */}
              <div className="bg-gradient-to-r from-purple/5 to-pink/5 border-2 border-purple/20 rounded-lg p-6 mb-6">
                <p className="text-lg text-gray-900">
                  <strong>Total Triggers Identified:</strong> {triggers_results.total_triggers}
                  <span className="text-sm text-gray-600 ml-2">
                    ({triggers_results.external_count} situational, {triggers_results.internal_count} emotional)
                  </span>
                </p>
                {triggers_results.pattern_description && (
                  <p className="text-sm text-gray-600 mt-2">{triggers_results.pattern_description}</p>
                )}
              </div>

              {/* External Triggers by Level */}
              {triggers_results.external_verdicts && triggers_results.external_verdicts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">External Triggers (Situations)</h3>
                  {triggers_results.external_verdicts.map((verdict) => {
                    const config = LEVEL_CONFIG[verdict.level] || LEVEL_CONFIG.never_use
                    return (
                      <div key={verdict.level} className={`border-2 ${config.borderClass} ${config.bgClass} rounded-lg p-4 sm:p-5`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badgeClass}`}>
                            {verdict.label.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({config.ratingLabel}) &middot; {verdict.count} trigger{verdict.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {verdict.triggers.map((triggerId) => (
                            <span
                              key={triggerId}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium ${config.badgeClass}`}
                            >
                              {formatTriggerName(triggerId)}
                            </span>
                          ))}
                        </div>
                        <p className={`text-sm ${config.textClass} italic`}>{verdict.verdict}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Internal Triggers by Level */}
              {triggers_results.internal_verdicts && triggers_results.internal_verdicts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Internal Triggers (Emotions)</h3>
                  {triggers_results.internal_verdicts.map((verdict) => {
                    const config = LEVEL_CONFIG[verdict.level] || LEVEL_CONFIG.never_use
                    return (
                      <div key={verdict.level} className={`border-2 ${config.borderClass} ${config.bgClass} rounded-lg p-4 sm:p-5`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badgeClass}`}>
                            {verdict.label.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({config.ratingLabel}) &middot; {verdict.count} trigger{verdict.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {verdict.triggers.map((triggerId) => (
                            <span
                              key={triggerId}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium ${config.badgeClass}`}
                            >
                              {formatTriggerName(triggerId)}
                            </span>
                          ))}
                        </div>
                        <p className={`text-sm ${config.textClass} italic`}>{verdict.verdict}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* AI Insight for Triggers */}
              {ai_feedback?.triggers_feedback && (
                <div className="mt-8 bg-gradient-to-br from-purple/5 to-pink/5 rounded-lg border-2 border-purple/20 p-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-purple flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Triggers Awareness</h3>
                      <p className="text-gray-700 leading-relaxed">{ai_feedback.triggers_feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              <ResultsFeedback
                sessionId={sessionId}
                tabName="triggers"
                colorTheme="purple"
                tabContentSummary={{
                  tab: 'triggers',
                  total_triggers: triggers_results.total_triggers,
                  external_count: triggers_results.external_count || 0,
                  internal_count: triggers_results.internal_count || 0,
                  highest_external_level: triggers_results.highest_external_level,
                  highest_internal_level: triggers_results.highest_internal_level,
                  ai_feedback_shown: !!ai_feedback?.triggers_feedback
                }}
              />
            </div>
          )}

          {/* Gambling Tab */}
          {activeTab === 'gambling' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="md:text-3xl text-2xl font-bold text-gray-900">Gambling Screening (PGSI)</h2>
              </div>

              {pgsi_results ? (
                <>
                  {/* Score card */}
                  <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Score</p>
                        <p className="text-5xl font-bold text-gray-900">{pgsi_results.total_score}<span className="text-xl text-gray-400 font-normal"> / 27</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-2">Risk Category</p>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          pgsi_results.risk_category === 'problem_gambler' ? 'bg-red text-white' :
                          pgsi_results.risk_category === 'moderate_risk'   ? 'bg-orange text-white' :
                          pgsi_results.risk_category === 'low_risk'        ? 'bg-blue text-white' :
                          'bg-green text-white'
                        }`}>
                          {pgsi_results.risk_category === 'problem_gambler' ? 'PROBLEM GAMBLER' :
                           pgsi_results.risk_category === 'moderate_risk'   ? 'MODERATE RISK' :
                           pgsi_results.risk_category === 'low_risk'        ? 'LOW RISK' :
                           'NO RISK'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk scale */}
                  <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">PGSI Risk Scale</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'No Risk',         range: '0',   color: 'bg-green',  active: pgsi_results.risk_category === 'no_risk' },
                        { label: 'Low Risk',        range: '1–4', color: 'bg-blue',   active: pgsi_results.risk_category === 'low_risk' },
                        { label: 'Moderate Risk',   range: '5–7', color: 'bg-orange', active: pgsi_results.risk_category === 'moderate_risk' },
                        { label: 'Problem Gambler', range: '8+',  color: 'bg-red',    active: pgsi_results.risk_category === 'problem_gambler' },
                      ].map(item => (
                        <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${item.active ? 'ring-2 ring-offset-1 ring-gray-400 bg-gray-50' : ''}`}>
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                          <span className={`flex-1 text-sm ${item.active ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{item.label}</span>
                          <span className="text-xs text-gray-400 font-mono">{item.range}</span>
                          {item.active && <span className="text-xs font-bold text-gray-500">← Your result</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description & recommendation */}
                  <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">What this means</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{pgsi_results.risk_description}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${pgsi_results.professional_help_recommended ? 'bg-orange/10 border border-orange/30' : 'bg-green/10 border border-green/30'}`}>
                      <h3 className={`font-semibold mb-1 ${pgsi_results.professional_help_recommended ? 'text-orange' : 'text-green'}`}>
                        {pgsi_results.professional_help_recommended ? '⚠️ Recommendation' : '✅ Recommendation'}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{pgsi_results.recommendation}</p>
                    </div>

                    {pgsi_results.professional_help_recommended && (
                      <div className="p-4 bg-blue/5 border border-blue/20 rounded-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <span className="font-semibold">Please consider reaching out</span> to a mental health professional or gambling counsellor. You can also speak with the VibeCheck support team via WhatsApp: <span className="font-semibold text-blue">+234 812 937 8557</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <ResultsFeedback
                    sessionId={sessionId}
                    tabName="gambling"
                    colorTheme="orange"
                    tabContentSummary={{
                      tab: 'gambling',
                      pgsi_score: pgsi_results.total_score,
                      pgsi_risk: pgsi_results.risk_category,
                    }}
                  />
                </>
              ) : (
                <div className="bg-white rounded-xl border-2 border-gray-100 p-8 text-center text-gray-500">
                  <p>Gambling screening data not available.</p>
                </div>
              )}
            </div>
          )}

          {/* Next Steps Tab */}
          {activeTab === 'next-steps' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="md:text-3xl text-2xl font-bold text-gray-900 mb-6">Recommended Next Steps</h2>

              {ai_feedback?.next_steps && ai_feedback.next_steps.length > 0 && (
                <div className="bg-gradient-to-r from-purple/5 to-blue/5 rounded-lg border-2 border-purple/20 p-6">
                  <ul className="space-y-4">
                    {ai_feedback.next_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-6 h-6 text-purple mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Government Mental Health Hospitals */}
              <div className="bg-gradient-to-r from-blue/5 to-green/5 rounded-lg border-2 border-blue/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🏥</span>
                  <h3 className="text-xl font-bold text-gray-900">Government Mental Health Hospitals in Nigeria</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  Below is a complete list of government-approved mental health facilities across Nigeria.
                  These hospitals provide professional psychiatric and mental health services.
                </p>

                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Hospital Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">State</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {NIGERIAN_HOSPITALS.map((hospital, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="text-gray-800">{hospital.name}</span>
                            {hospital.address && (
                              <p className="text-xs text-gray-400 mt-0.5">{hospital.address}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{hospital.state}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                hospital.type === 'Federal' ? 'bg-red/10 text-red' :
                                hospital.type === 'Rehabilitation' ? 'bg-green/10 text-green' :
                                hospital.type === 'Teaching' ? '' :
                                'bg-purple/10 text-purple'
                              }`}
                              style={hospital.type === 'Teaching' ? { backgroundColor: 'rgba(18, 74, 102, 0.1)', color: '#124A66' } : {}}
                            >
                              {hospital.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-500 mt-3 italic">
                  * Federal = Federal Neuro-Psychiatric Hospitals | Teaching = University Teaching Hospitals | State = State Psychiatric Hospitals | Rehabilitation = Nigeria Counselling & Rehabilitation Centres
                </p>
              </div>

              {/* Chat with AI */}
              <div className={`${chatColors.bg} border-2 ${chatColors.border} rounded-xl shadow-md p-6 mt-8`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {fromHistory ? 'Continue Your Conversation' : 'Want to Talk More?'}
                </h3>
                <p className="text-gray-700 mb-6">
                  {fromHistory
                    ? 'Pick up where you left off — your previous messages are saved and waiting.'
                    : 'Chat with our AI support bot to discuss your results, ask questions, and get additional guidance tailored to your situation.'}
                </p>
                <button
                  onClick={() => navigate(`/chat?session_id=${sessionId}`)}
                  className={`${chatColors.button} text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>{fromHistory ? 'Continue Conversation' : 'Chat with AI Support'}</span>
                </button>
              </div>

              {/* Feedback Section */}
              <ResultsFeedback
                sessionId={sessionId}
                tabName="next-steps"
                colorTheme="green"
                tabContentSummary={{
                  tab: 'next-steps',
                  steps_count: ai_feedback?.next_steps?.length || 0,
                  ai_steps_shown: !!(ai_feedback?.next_steps && ai_feedback.next_steps.length > 0)
                }}
              />

              {/* Disclaimer */}
              <div className="bg-gray-100 rounded-lg p-6 text-center mt-8">
                <p className="text-sm text-gray-600">
                  <strong>Important:</strong> This screening is not a diagnosis. The results and recommendations are for informational purposes only.
                  Please consult with a healthcare professional for personalized medical advice.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Support & Membership */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Donation Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">Support This Work</h3>
                  <p className="text-sm text-gray-500">Help ISSUP Nigeria reach more people</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 flex-1">
                {/* Account Name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Account Name</p>
                    <p className="text-sm font-medium text-gray-800 leading-snug">Nigerian Society of Substance Use Prevention and Treatment Professionals</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('Nigerian Society of Substance Use Prevention and Treatment Professionals', 'name')}
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-purple transition-colors px-2 py-1 rounded-lg hover:bg-purple/5 mt-4"
                  >
                    {copiedField === 'name' ? (
                      <><svg className="w-3.5 h-3.5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green">Copied</span></>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span>Copy</span></>
                    )}
                  </button>
                </div>
                {/* Bank */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Bank</p>
                    <p className="text-sm font-medium text-gray-800">Guaranty Trust Bank (GTB)</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('Guaranty Trust Bank (GTB)', 'bank')}
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-purple transition-colors px-2 py-1 rounded-lg hover:bg-purple/5"
                  >
                    {copiedField === 'bank' ? (
                      <><svg className="w-3.5 h-3.5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green">Copied</span></>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span>Copy</span></>
                    )}
                  </button>
                </div>
                {/* Account Number — prominent */}
                <div className="bg-white border-2 border-purple/20 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Account Number</p>
                    <p className="text-2xl font-bold text-purple tracking-widest">0458103259</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('0458103259', 'accnum')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                      copiedField === 'accnum' ? 'bg-green text-white' : 'bg-purple text-white hover:bg-purple/90'
                    }`}
                  >
                    {copiedField === 'accnum' ? (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Membership Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">Join the Movement</h3>
                  <p className="text-sm text-gray-500">Become part of the ISSUP community</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 flex-1">
                Join a network of professionals and advocates dedicated to substance use prevention and mental health support across Nigeria and the world.
              </p>
              <div className="space-y-3">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdEoLn2RryPmSnmO0NQqJVXYpbwFUq_FZzDKZpBZvGrCTlSLg/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-purple text-white rounded-xl px-5 py-3 font-semibold hover:bg-purple/90 transition-all shadow-sm"
                >
                  <span>Join ISSUP Nigeria</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://www.issup.net/membership/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full border-2 border-teal text-teal rounded-xl px-5 py-3 font-semibold hover:bg-teal/5 transition-all"
                >
                  <span>Join ISSUP International</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Improvement Suggestion */}
        <div className="max-w-4xl mx-auto px-4 pb-12 mt-10">
          <div className="bg-white border-2 border-purple/20 rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-purple mb-1">Help us improve VibeCheck</h3>
            <p className="text-gray-600 text-sm mb-4">What other features would you like to see on VibeCheck?</p>

            {suggestionSubmitted ? (
              <div className="flex items-center gap-2 text-green font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Thank you for your suggestion!
              </div>
            ) : (
              <div>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  maxLength={2000}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">{suggestion.length}/2000</span>
                  <button
                    onClick={async () => {
                      if (!suggestion.trim() || suggestionSubmitting) return
                      setSuggestionSubmitting(true)
                      try {
                        await submitImprovementSuggestion(sessionId, suggestion.trim())
                        setSuggestionSubmitted(true)
                      } catch {
                        // fail silently — non-critical
                      } finally {
                        setSuggestionSubmitting(false)
                      }
                    }}
                    disabled={!suggestion.trim() || suggestionSubmitting}
                    className="bg-purple text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                  >
                    {suggestionSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results
