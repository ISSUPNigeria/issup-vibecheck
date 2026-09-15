import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchValidatedQuestions, submitValidatedScreening } from '../../services/api'
import DemographicsStep from './DemographicsStep'
import ASSISTIntro from './ASSISTIntro'
import ASSISTQ1 from './ASSISTQ1'
import ASSISTQuestions from './ASSISTQuestions'
import ASSISTInjectionQuestion from './ASSISTInjectionQuestion'
import ASSISTResultsSummary from './ASSISTResultsSummary'
import ExternalTriggersScreening from './ExternalTriggersScreening'
import InternalTriggersScreening from './InternalTriggersScreening'
import TriggersResultsSummary from './TriggersResultsSummary'
import PGSIScreening from './PGSIScreening'
import PHQ9Screening from './PHQ9Screening'
import PHQ9ResultsSummary from './PHQ9ResultsSummary'
import InstrumentProgressBar from './InstrumentProgressBar'
import ConsentForm from './ConsentForm'

/**
 * Main orchestrator for validated screening flow
 *
 * Flow:
 * 0. Data Use & Consent
 * 1. Demographics
 * 2. ASSIST Intro
 * 3. ASSIST Q1 (Lifetime Use)
 * 4. ASSIST Q2-Q7 (Per-substance questions) - Skip if no substances selected
 * 5. ASSIST Q8 (Injection use) - Skip if no substances selected
 * 6. ASSIST Results Summary
 * 7. External Triggers (conditional - only if ASSIST moderate+)
 * 8. Internal Triggers (conditional - only if ASSIST moderate+)
 * 9. PHQ-9 (Depression)
 * 10. PHQ-9 Results Summary
 * 11. Submit → Final Results
 */
const ValidatedScreeningFlow = () => {
  const navigate = useNavigate()

  // Screening questions from backend
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Current step tracking
  const [currentStep, setCurrentStep] = useState('consent')

  // Response data
  const [demographics, setDemographics] = useState(null)
  const [assistLifetimeUse, setAssistLifetimeUse] = useState(null)
  const [assistSubstanceResponses, setAssistSubstanceResponses] = useState(null)
  const [assistInjection, setAssistInjection] = useState(null)
  const [assistResults, setAssistResults] = useState(null)
  const [triggersData, setTriggersData] = useState({
    external_ratings: {},
    external_custom: [],
    internal_ratings: {},
    internal_custom: [],
  })
  const [pgsiData, setPgsiData] = useState(null)
  const [phq9Data, setPhq9Data] = useState(null)
  const [phq9Results, setPhq9Results] = useState(null)

  // Triggers eligibility (based on ASSIST only now)
  const [shouldShowTriggers, setShouldShowTriggers] = useState(false)

  // Track completed instruments for progress bar
  const [completedInstruments, setCompletedInstruments] = useState([])

  // Submitting state
  const [submitting, setSubmitting] = useState(false)

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentStep])

  // Fetch questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchValidatedQuestions()
        setQuestions(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load questions:', err)
        setError('Failed to load screening questions. Please try again.')
        setLoading(false)
      }
    }

    loadQuestions()
  }, [])

  // Get current instrument for progress bar
  const getCurrentInstrument = () => {
    if (['demographics', 'assist_intro', 'assist_lifetime_use', 'assist_substance_questions', 'assist_injection', 'assist_results'].includes(currentStep)) {
      return 'assist'
    }
    if (['pgsi'].includes(currentStep)) {
      return 'pgsi'
    }
    if (['external_triggers', 'internal_triggers', 'triggers_results'].includes(currentStep)) {
      return 'triggers'
    }
    return 'phq9'
  }

  // Handle consent completion
  const handleConsentComplete = () => {
    setCurrentStep('demographics')
  }

  // Handle demographics completion
  const handleDemographicsComplete = (data) => {
    setDemographics(data)
    setCurrentStep('assist_intro')
  }

  // Handle ASSIST intro continue
  const handleAssistIntroComplete = () => {
    setCurrentStep('assist_lifetime_use')
  }

  // Handle ASSIST Q1 completion
  const handleAssistLifetimeComplete = (data) => {
    setAssistLifetimeUse(data)

    // Get selected substances
    const selectedSubstances = Object.keys(data.lifetime_use).filter(sub => data.lifetime_use[sub])

    if (selectedSubstances.length > 0) {
      setCurrentStep('assist_substance_questions')
    } else {
      // No substances selected - calculate results and go to ASSIST results
      const noSubstanceResults = {
        scores: {},
        overall_risk: 'low',
        injection_drug_use: 0,
        brief_intervention_needed: false
      }
      setAssistResults(noSubstanceResults)
      setShouldShowTriggers(false)
      setCurrentStep('assist_results')
    }
  }

  // Handle ASSIST Q2-Q7 completion
  const handleAssistSubstanceComplete = (data) => {
    setAssistSubstanceResponses(data)
    setCurrentStep('assist_injection')
  }

  // Handle ASSIST Q8 completion
  const handleAssistInjectionComplete = (data) => {
    setAssistInjection(data)

    // Calculate ASSIST results locally for intermediate display
    const calculatedResults = calculateAssistResults(assistLifetimeUse, assistSubstanceResponses, data)
    setAssistResults(calculatedResults)

    // Determine if triggers should be shown (based on ASSIST only)
    const needsTriggers = calculatedResults.overall_risk === 'moderate' || calculatedResults.overall_risk === 'high'
    setShouldShowTriggers(needsTriggers)

    setCurrentStep('assist_results')
  }

  // Handle ASSIST results continue → always go to PGSI next
  const handleAssistResultsContinue = () => {
    setCompletedInstruments(prev => [...prev, 'assist'])
    setCurrentStep('pgsi')
  }

  // Handle PGSI completion
  const handlePgsiComplete = (data) => {
    setPgsiData(data)
    setCompletedInstruments(prev => [...prev, 'pgsi'])

    if (shouldShowTriggers) {
      setCurrentStep('external_triggers')
    } else {
      setCompletedInstruments(prev => [...prev, 'triggers'])
      setCurrentStep('phq9')
    }
  }

  // Handle External Triggers completion → move to Internal Triggers
  const handleExternalTriggersComplete = (data) => {
    setTriggersData(prev => ({ ...prev, ...data }))
    setCurrentStep('internal_triggers')
  }

  // Handle Internal Triggers completion → move to Triggers Results
  const handleInternalTriggersComplete = (data) => {
    setTriggersData(prev => ({ ...prev, ...data }))
    setCurrentStep('triggers_results')
  }

  // Handle Triggers Results continue → move to PHQ-9
  const handleTriggersResultsContinue = () => {
    setCompletedInstruments(prev => [...prev, 'triggers'])
    setCurrentStep('phq9')
  }

  // Handle PHQ-9 completion
  const handlePhq9Complete = (data) => {
    setPhq9Data(data)

    // Calculate PHQ-9 results locally
    const calculatedPhq9 = calculatePhq9Results(data)
    setPhq9Results(calculatedPhq9)

    setCurrentStep('phq9_results')
  }

  // Handle PHQ-9 results continue (final submit)
  const handlePhq9ResultsContinue = async () => {
    setCompletedInstruments(prev => [...prev, 'phq9'])
    await submitScreening()
  }

  // Calculate ASSIST results locally for intermediate display
  const calculateAssistResults = (lifetimeData, substanceResponses, injectionData) => {
    const scores = {}
    let overallRisk = 'low'
    let briefInterventionNeeded = false

    if (substanceResponses) {
      for (const [substanceKey, responses] of Object.entries(substanceResponses)) {
        let totalScore = 0

        // Check if this is a custom "other" substance (other_0, other_1, etc.)
        const isCustomOther = substanceKey.startsWith('other_')
        const isTobacco = substanceKey === 'tobacco'

        // Sum scores for Q2-Q7 (Q5 excluded for tobacco only)
        Object.entries(responses).forEach(([qNum, score]) => {
          if (isTobacco && qNum === '5') return
          totalScore += score || 0
        })

        // Determine risk level (custom substances use standard thresholds)
        let riskLevel = 'low'
        if (isTobacco) {
          if (totalScore >= 27) riskLevel = 'high'
          else if (totalScore >= 4) riskLevel = 'moderate'
        } else {
          if (totalScore >= 27) riskLevel = 'high'
          else if (totalScore >= 11) riskLevel = 'moderate'
        }

        // Get display name for custom substances
        let displayName = substanceKey
        if (isCustomOther && lifetimeData?.other_specify) {
          const customNames = lifetimeData.other_specify.split(',').map(s => s.trim()).filter(s => s)
          const idx = parseInt(substanceKey.split('_')[1])
          if (customNames[idx]) {
            displayName = customNames[idx]
          }
        }

        scores[substanceKey] = {
          score: totalScore,
          risk_level: riskLevel,
          display_name: displayName
        }

        // Update overall risk
        if (riskLevel === 'high') {
          overallRisk = 'high'
          briefInterventionNeeded = true
        } else if (riskLevel === 'moderate' && overallRisk !== 'high') {
          overallRisk = 'moderate'
          briefInterventionNeeded = true
        }
      }
    }

    return {
      scores,
      overall_risk: overallRisk,
      injection_drug_use: injectionData || 0,
      brief_intervention_needed: briefInterventionNeeded
    }
  }

  // Calculate PHQ-9 results locally
  const calculatePhq9Results = (data) => {
    if (!data) return null

    const totalScore = Object.values(data.responses).reduce((sum, val) => sum + val, 0)
    const suicidalIdeation = data.responses[9] > 0

    let severity = 'minimal'
    let severityDescription = 'Your responses indicate minimal symptoms.'

    if (totalScore >= 20) {
      severity = 'severe'
      severityDescription = 'Your responses indicate severe depression symptoms. Professional help is strongly recommended.'
    } else if (totalScore >= 15) {
      severity = 'moderately_severe'
      severityDescription = 'Your responses indicate moderately severe depression symptoms. Active treatment is recommended.'
    } else if (totalScore >= 10) {
      severity = 'moderate'
      severityDescription = 'Your responses indicate moderate depression symptoms. Consider speaking with a professional.'
    } else if (totalScore >= 5) {
      severity = 'mild'
      severityDescription = 'Your responses indicate mild depression symptoms. Monitor your symptoms and practice self-care.'
    }

    return {
      total_score: totalScore,
      severity,
      severity_description: severityDescription,
      functional_impairment: data.functional_impairment,
      suicidal_ideation: suicidalIdeation
    }
  }

  // Submit complete screening
  const submitScreening = async () => {
    setSubmitting(true)

    try {
      // Map score values to response choice indices
      const mapQ2 = (score) => {
        const scoreMap = {0: 0, 2: 1, 3: 2, 4: 3, 6: 4}
        return scoreMap[score] !== undefined ? scoreMap[score] : 0
      }
      const mapQ3 = (score) => {
        const scoreMap = {0: 0, 3: 1, 4: 2, 5: 3, 6: 4}
        return scoreMap[score] !== undefined ? scoreMap[score] : 0
      }
      const mapQ4 = (score) => {
        const scoreMap = {0: 0, 4: 1, 5: 2, 6: 3, 7: 4}
        return scoreMap[score] !== undefined ? scoreMap[score] : 0
      }
      const mapQ5 = (score) => {
        const scoreMap = {0: 0, 5: 1, 6: 2, 7: 3, 8: 4}
        return scoreMap[score] !== undefined ? scoreMap[score] : 0
      }
      const mapQ6Q7 = (score) => {
        // Backend expects: 0=No never, 1=Yes past 3m (score 6), 2=Yes not past 3m (score 3)
        const scoreMap = {0: 0, 6: 1, 3: 2}
        return scoreMap[score] !== undefined ? scoreMap[score] : 0
      }

      // Transform ASSIST substance responses to match backend schema
      // Consolidate other_0, other_1, etc. back into single "other" entry
      const transformedSubstanceResponses = {}
      let otherResponses = [] // Collect all "other_X" responses

      if (assistSubstanceResponses) {
        for (const [substance, responses] of Object.entries(assistSubstanceResponses)) {
          // Check if this is a custom "other" substance (other_0, other_1, etc.)
          if (substance.startsWith('other_')) {
            otherResponses.push(responses)
          } else {
            // Regular predefined substance
            transformedSubstanceResponses[substance] = {
              q2_frequency: mapQ2(responses[2] || 0),
              q3_cravings: mapQ3(responses[3] || 0),
              q4_problems: mapQ4(responses[4] || 0),
              q5_failed_expectations: substance === 'tobacco' ? undefined : mapQ5(responses[5] || 0),
              q6_concern: mapQ6Q7(responses[6] || 0),
              q7_control: mapQ6Q7(responses[7] || 0)
            }
          }
        }

        // Consolidate all "other" substances into single entry using highest scores
        if (otherResponses.length > 0) {
          // Find the highest score for each question across all custom substances
          const consolidatedOther = {
            2: Math.max(...otherResponses.map(r => r[2] || 0)),
            3: Math.max(...otherResponses.map(r => r[3] || 0)),
            4: Math.max(...otherResponses.map(r => r[4] || 0)),
            5: Math.max(...otherResponses.map(r => r[5] || 0)),
            6: Math.max(...otherResponses.map(r => r[6] || 0)),
            7: Math.max(...otherResponses.map(r => r[7] || 0))
          }

          transformedSubstanceResponses['other'] = {
            q2_frequency: mapQ2(consolidatedOther[2]),
            q3_cravings: mapQ3(consolidatedOther[3]),
            q4_problems: mapQ4(consolidatedOther[4]),
            q5_failed_expectations: mapQ5(consolidatedOther[5]),
            q6_concern: mapQ6Q7(consolidatedOther[6]),
            q7_control: mapQ6Q7(consolidatedOther[7])
          }
        }
      }

      // Build ASSIST response
      const assistResponse = {
        q1_lifetime_use: {
          tobacco: assistLifetimeUse?.lifetime_use?.tobacco || false,
          alcohol: assistLifetimeUse?.lifetime_use?.alcohol || false,
          cannabis: assistLifetimeUse?.lifetime_use?.cannabis || false,
          cocaine: assistLifetimeUse?.lifetime_use?.cocaine || false,
          amphetamines: assistLifetimeUse?.lifetime_use?.amphetamines || false,
          inhalants: assistLifetimeUse?.lifetime_use?.inhalants || false,
          sedatives: assistLifetimeUse?.lifetime_use?.sedatives || false,
          hallucinogens: assistLifetimeUse?.lifetime_use?.hallucinogens || false,
          opioids: assistLifetimeUse?.lifetime_use?.opioids || false,
          other: assistLifetimeUse?.lifetime_use?.other || false,
          other_specify: assistLifetimeUse?.other_specify || null
        },
        substance_responses: transformedSubstanceResponses,
        q8_injection: assistInjection || 0
      }

      // Transform PHQ-9 responses
      const phq9Response = {
        q1_interest: phq9Data?.responses[1] || 0,
        q2_depressed: phq9Data?.responses[2] || 0,
        q3_sleep: phq9Data?.responses[3] || 0,
        q4_tired: phq9Data?.responses[4] || 0,
        q5_appetite: phq9Data?.responses[5] || 0,
        q6_failure: phq9Data?.responses[6] || 0,
        q7_concentration: phq9Data?.responses[7] || 0,
        q8_movement: phq9Data?.responses[8] || 0,
        q9_selfharm: phq9Data?.responses[9] || 0,
        functional_impairment: phq9Data?.functional_impairment || 'not_difficult'
      }

      // Build PGSI response
      const pgsiResponse = {
        q1: pgsiData?.responses[1] || 0,
        q2: pgsiData?.responses[2] || 0,
        q3: pgsiData?.responses[3] || 0,
        q4: pgsiData?.responses[4] || 0,
        q5: pgsiData?.responses[5] || 0,
        q6: pgsiData?.responses[6] || 0,
        q7: pgsiData?.responses[7] || 0,
        q8: pgsiData?.responses[8] || 0,
        q9: pgsiData?.responses[9] || 0,
      }

      // Build submission data
      const submissionData = {
        demographics,
        assist: assistResponse,
        pgsi: pgsiResponse,
        phq9: phq9Response,
        triggers: triggersData
      }

      console.log('Submitting screening:', submissionData)

      const result = await submitValidatedScreening(submissionData)

      console.log('Screening result:', result)

      // Navigate to results page
      navigate(`/results?session_id=${result.session_id}`)
    } catch (err) {
      console.error('Failed to submit screening:', err)
      alert('Failed to submit screening. Please try again.')
      setSubmitting(false)
    }
  }

  // Get selected substances for ASSIST Q2-Q7
  // Expands "other" into individual custom substances if comma-separated
  const getSelectedSubstances = () => {
    if (!assistLifetimeUse) return []

    const selected = Object.keys(assistLifetimeUse.lifetime_use).filter(sub => assistLifetimeUse.lifetime_use[sub])

    // If "other" is selected and has specified substances, expand them
    if (selected.includes('other') && assistLifetimeUse.other_specify) {
      const otherSubstances = assistLifetimeUse.other_specify
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      if (otherSubstances.length > 0) {
        // Replace 'other' with individual custom substances
        const withoutOther = selected.filter(s => s !== 'other')
        const customSubstances = otherSubstances.map((name, idx) => `other_${idx}:${name}`)
        return [...withoutOther, ...customSubstances]
      }
    }

    return selected
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading screening questions...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple text-white rounded-lg hover:bg-purple/90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Submitting state
  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Processing your screening...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we analyze your responses.</p>
        </div>
      </div>
    )
  }

  // Check if we should show the instrument progress bar
  const showInstrumentProgress = !['consent', 'demographics'].includes(currentStep)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Instrument Progress Bar */}
      {showInstrumentProgress && (
        <div className="max-w-5xl mx-auto mb-6">
          <InstrumentProgressBar
            currentInstrument={getCurrentInstrument()}
            completedInstruments={completedInstruments}
            showTriggers={shouldShowTriggers || currentStep === 'assist_intro' || currentStep === 'assist_lifetime_use'}
          />
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-5xl mx-auto">
        {currentStep === 'consent' && (
          <ConsentForm onContinue={handleConsentComplete} />
        )}

        {currentStep === 'demographics' && (
          <DemographicsStep
            onComplete={handleDemographicsComplete}
            onUpdate={() => {}}
            demographics={demographics}
          />
        )}

        {currentStep === 'assist_intro' && (
          <ASSISTIntro
            onContinue={handleAssistIntroComplete}
            onBack={() => setCurrentStep('demographics')}
          />
        )}

        {currentStep === 'assist_lifetime_use' && questions && (
          <ASSISTQ1
            question={questions.assist_questions.find(q => q.question_number === 1)}
            onComplete={handleAssistLifetimeComplete}
            onBack={() => setCurrentStep('assist_intro')}
            initialData={assistLifetimeUse}
          />
        )}

        {currentStep === 'assist_substance_questions' && questions && (
          <ASSISTQuestions
            questions={questions.assist_questions.filter(q => q.question_number >= 2 && q.question_number <= 7)}
            selectedSubstances={getSelectedSubstances()}
            onComplete={handleAssistSubstanceComplete}
            onBack={() => setCurrentStep('assist_lifetime_use')}
            initialData={assistSubstanceResponses}
          />
        )}

        {currentStep === 'assist_injection' && questions && (
          <ASSISTInjectionQuestion
            question={questions.assist_questions.find(q => q.question_number === 8)}
            onComplete={handleAssistInjectionComplete}
            onBack={() => setCurrentStep('assist_substance_questions')}
            initialData={assistInjection}
          />
        )}

        {currentStep === 'assist_results' && (
          <ASSISTResultsSummary
            results={assistResults}
            onContinue={handleAssistResultsContinue}
          />
        )}

        {currentStep === 'pgsi' && (
          <PGSIScreening
            onComplete={handlePgsiComplete}
            onBack={() => setCurrentStep('assist_results')}
            initialData={pgsiData}
          />
        )}

        {currentStep === 'external_triggers' && (
          <ExternalTriggersScreening
            onComplete={handleExternalTriggersComplete}
            onBack={() => setCurrentStep('assist_results')}
            initialData={triggersData}
          />
        )}

        {currentStep === 'internal_triggers' && (
          <InternalTriggersScreening
            onComplete={handleInternalTriggersComplete}
            onBack={() => setCurrentStep('external_triggers')}
            initialData={triggersData}
          />
        )}

        {currentStep === 'triggers_results' && (
          <TriggersResultsSummary
            triggersData={triggersData}
            onContinue={handleTriggersResultsContinue}
            onBack={() => setCurrentStep('internal_triggers')}
          />
        )}

        {currentStep === 'phq9' && (
          <PHQ9Screening
            onComplete={handlePhq9Complete}
            onBack={() => shouldShowTriggers ? setCurrentStep('triggers_results') : setCurrentStep('pgsi')}
            initialData={phq9Data}
          />
        )}

        {currentStep === 'phq9_results' && (
          <PHQ9ResultsSummary
            results={phq9Results}
            onContinue={handlePhq9ResultsContinue}
            isFinal={true}
          />
        )}
      </div>
    </div>
  )
}

export default ValidatedScreeningFlow