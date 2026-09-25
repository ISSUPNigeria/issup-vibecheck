import { jsPDF } from 'jspdf'
import { formatTriggerName } from './triggerLabels'
import { NIGERIAN_HOSPITALS } from '../constants/hospitals'

// ============================================================================
// Helper to load image as base64 for PDF embedding
// ============================================================================
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

// ============================================================================
// Substance-specific harm information — mirrors Results.jsx getSubstanceHarms
// so the PDF matches what the user already saw on the Substance Use tab.
// ============================================================================
const SUBSTANCE_HARMS = {
  tobacco: {
    statement: 'Regular tobacco smoking is associated with:',
    harms: [
      'Premature aging, wrinkling of the skin',
      'Respiratory infections and asthma',
      'High blood pressure, diabetes',
      'Respiratory infections, allergies and asthma in children of smokers',
      'Miscarriage, premature labour and low birth weight babies for pregnant women',
      'Kidney disease',
      'Chronic obstructive airways disease',
      'Heart disease, stroke, vascular disease',
      'Cancers'
    ]
  },
  alcohol: {
    statement: 'Regular excessive alcohol use is associated with:',
    harms: [
      'Hangovers, aggressive and violent behaviour, accidents and injury',
      'Reduced sexual performance, premature ageing',
      'Digestive problems, ulcers, inflammation of the pancreas, high blood pressure',
      'Anxiety and depression, relationship difficulties, financial and work problems',
      'Difficulty remembering things and solving problems',
      'Deformities and brain damage in babies of pregnant women',
      'Stroke, permanent brain injury, muscle and nerve damage',
      'Liver disease, pancreas disease',
      'Cancers, suicide'
    ]
  },
  cannabis: {
    statement: 'Regular use of cannabis is associated with:',
    harms: [
      'Problems with attention and motivation',
      'Anxiety, paranoia, panic, depression',
      'Decreased memory and problem solving ability',
      'High blood pressure',
      'Asthma, bronchitis',
      'Psychosis in those with a personal or family history of schizophrenia',
      'Heart disease and chronic obstructive airways disease',
      'Cancers'
    ]
  },
  cocaine: {
    statement: 'Regular use of cocaine is associated with:',
    harms: [
      'Difficulty sleeping, heart racing, headaches, weight loss',
      'Numbness, tingling, clammy skin, skin scratching or picking',
      'Accidents and injury, financial problems',
      'Irrational thoughts',
      'Mood swings - anxiety, depression, mania',
      'Aggression and paranoia',
      'Intense craving, stress from the lifestyle',
      'Psychosis after repeated use of high doses',
      'Sudden death from heart problems'
    ]
  },
  amphetamines: {
    statement: 'Regular use of amphetamine type stimulants is associated with:',
    harms: [
      'Difficulty sleeping, loss of appetite and weight loss, dehydration',
      'Jaw clenching, headaches, muscle pain',
      'Mood swings – anxiety, depression, agitation, mania, panic, paranoia',
      'Tremors, irregular heartbeat, shortness of breath',
      'Aggressive and violent behaviour',
      'Psychosis after repeated use of high doses',
      'Permanent damage to brain cells',
      'Liver damage, brain haemorrhage, sudden death (ecstasy) in rare situations'
    ]
  },
  inhalants: {
    statement: 'Regular use of inhalants is associated with:',
    harms: [
      'Dizziness and hallucinations, drowsiness, disorientation, blurred vision',
      'Flu like symptoms, sinusitis, nosebleeds',
      'Indigestion, stomach ulcers',
      'Accidents and injury',
      'Memory loss, confusion, depression, aggression',
      'Coordination difficulties, slowed reactions, hypoxia',
      'Delirium, seizures, coma, organ damage (heart, lungs, liver, kidneys)',
      'Death from heart failure'
    ]
  },
  sedatives: {
    statement: 'Regular use of sedatives is associated with:',
    harms: [
      'Drowsiness, dizziness and confusion',
      'Difficulty concentrating and remembering things',
      'Nausea, headaches, unsteady gait',
      'Sleeping problems',
      'Anxiety and depression',
      'Tolerance and dependence after a short period of use',
      'Severe withdrawal symptoms',
      'Overdose and death if used with alcohol, opioids or other depressant drugs'
    ]
  },
  hallucinogens: {
    statement: 'Regular use of hallucinogens is associated with:',
    harms: [
      'Hallucinations (pleasant or unpleasant) – visual, auditory, tactile, olfactory',
      'Difficulty sleeping',
      'Nausea and vomiting',
      'Increased heart rate and blood pressure',
      'Mood swings',
      'Anxiety, panic, paranoia',
      'Flash-backs',
      'Increase the effects of mental illnesses such as schizophrenia'
    ]
  },
  opioids: {
    statement: 'Regular use of opioids is associated with:',
    harms: [
      'Itching, nausea and vomiting',
      'Drowsiness',
      'Constipation, tooth decay',
      'Difficulty concentrating and remembering things',
      'Reduced sexual desire and sexual performance',
      'Relationship difficulties',
      'Financial and work problems, violations of law',
      'Tolerance and dependence, withdrawal symptoms',
      'Overdose and death from respiratory failure'
    ]
  },
  other: {
    statement: 'Regular substance use may be associated with:',
    harms: [
      'Physical and mental health problems',
      'Tolerance and dependence over time',
      'Withdrawal symptoms when stopping',
      'Accidents and injury',
      'Relationship and social difficulties',
      'Financial and work problems',
      'The specific risks depend on the substance - please consult a healthcare provider for personalized guidance'
    ]
  }
}

const getSubstanceHarms = (substanceName) => {
  const normalized = substanceName.toLowerCase().replace(/_/g, '')
  const key = Object.keys(SUBSTANCE_HARMS).find(k => normalized.includes(k.replace(/_/g, ''))) || 'other'
  return SUBSTANCE_HARMS[key] || SUBSTANCE_HARMS.other
}

/**
 * Generate a full PDF report for validated screening results.
 * Renders one section per completed instrument — a section is skipped
 * entirely when that instrument wasn't part of this screening, mirroring
 * which tabs appear on the Results page.
 * Brand colors: Purple #5B2D91 (Primary), Red #E53935, Blue #2F80C3, Green #7CB342, Orange #F2992E
 */
export const generateScreeningPDF = async (results) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin

  const colors = {
    primary: [91, 45, 145],
    red: [229, 57, 53],
    blue: [47, 128, 195],
    green: [124, 179, 66],
    orange: [242, 153, 46],
    darkText: [51, 51, 51],
    lightText: [120, 120, 120],
    border: [224, 224, 224],
    lightBg: [250, 250, 250],
    lightPurple: [243, 237, 250],
    white: [255, 255, 255]
  }

  const getRiskColor = (level) => {
    const riskColors = {
      high: colors.red,
      severe: colors.red,
      problem_gambler: colors.red,
      moderately_severe: colors.orange,
      moderate: colors.orange,
      moderate_risk: colors.orange,
      mild: colors.blue,
      low_risk: colors.blue,
      low: colors.green,
      minimal: colors.green,
      no_risk: colors.green
    }
    return riskColors[level] || colors.lightText
  }

  // ---- Layout helpers ----
  const checkNewPage = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 25) {
      addPageFooter()
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  const addPageFooter = () => {
    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
    doc.setFontSize(8)
    doc.setTextColor(...colors.lightText)
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  const addSectionTitle = (title, color = colors.primary) => {
    checkNewPage(25)
    yPosition += 8
    doc.setFillColor(...color)
    doc.rect(margin, yPosition, 4, 12, 'F')
    doc.setFontSize(14)
    doc.setTextColor(...colors.darkText)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 10, yPosition + 9)
    yPosition += 18
  }

  const addSubsectionTitle = (title) => {
    checkNewPage(15)
    doc.setFontSize(11)
    doc.setTextColor(...colors.darkText)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, yPosition)
    yPosition += 7
  }

  const addText = (text, fontSize = 10, color = colors.darkText, bold = false, indent = 0) => {
    checkNewPage(8)
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, contentWidth - indent)
    lines.forEach(line => {
      checkNewPage(6)
      doc.text(line, margin + indent, yPosition)
      yPosition += fontSize * 0.45
    })
    yPosition += 2
  }

  // Bullet list — used for substance harms and other itemized notes
  const addBulletList = (items, fontSize = 9, color = colors.darkText, indent = 5) => {
    items.forEach(item => {
      checkNewPage(8)
      doc.setFontSize(fontSize)
      doc.setTextColor(...color)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(item, contentWidth - indent - 4)
      lines.forEach((line, idx) => {
        checkNewPage(6)
        const prefix = idx === 0 ? '•  ' : '   '
        doc.text(prefix + line, margin + indent, yPosition)
        yPosition += fontSize * 0.5
      })
    })
    yPosition += 2
  }

  const addKeyValue = (key, value, keyColor = colors.lightText) => {
    checkNewPage(8)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...keyColor)
    doc.text(key + ':', margin, yPosition)
    const keyWidth = doc.getTextWidth(key + ': ')
    doc.setTextColor(...colors.darkText)
    doc.setFont('helvetica', 'bold')
    doc.text(value, margin + keyWidth, yPosition)
    yPosition += 6
  }

  const addRiskBadge = (label, level, score = null) => {
    checkNewPage(12)
    const badgeColor = getRiskColor(level)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.darkText)
    doc.text(label, margin, yPosition)
    const labelWidth = doc.getTextWidth(label + ' ')
    const badgeText = score !== null ? `${String(level).toUpperCase()} (${score})` : String(level).toUpperCase()
    const badgeWidth = doc.getTextWidth(badgeText) + 8
    doc.setFillColor(...badgeColor)
    doc.roundedRect(margin + labelWidth, yPosition - 5, badgeWidth, 7, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(badgeText, margin + labelWidth + 4, yPosition - 0.5)
    yPosition += 8
  }

  const addDivider = () => {
    checkNewPage(8)
    yPosition += 3
    doc.setDrawColor(...colors.border)
    doc.setLineWidth(0.3)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 6
  }

  const drawTable = (headers, rows, colWidths) => {
    const rowHeight = 8
    const headerHeight = 10
    let startX = margin

    checkNewPage(headerHeight + (rows.length * rowHeight) + 10)

    doc.setFillColor(...colors.primary)
    doc.rect(margin, yPosition, contentWidth, headerHeight, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    headers.forEach((header, i) => {
      doc.text(header, startX + 3, yPosition + 7)
      startX += colWidths[i]
    })
    yPosition += headerHeight

    rows.forEach((row, rowIndex) => {
      checkNewPage(rowHeight + 5)
      if (rowIndex % 2 === 0) {
        doc.setFillColor(...colors.lightBg)
        doc.rect(margin, yPosition, contentWidth, rowHeight, 'F')
      }
      doc.setDrawColor(...colors.border)
      doc.setLineWidth(0.2)
      doc.rect(margin, yPosition, contentWidth, rowHeight, 'S')

      startX = margin
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.darkText)

      row.forEach((cell, i) => {
        if (typeof cell === 'object' && cell !== null && cell.text && cell.color) {
          const badgeWidth = Math.min(doc.getTextWidth(cell.text) + 6, colWidths[i] - 6)
          doc.setFillColor(...cell.color)
          doc.roundedRect(startX + 2, yPosition + 1.5, badgeWidth, 5, 1, 1, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(8)
          doc.text(cell.text, startX + 5, yPosition + 5)
          doc.setTextColor(...colors.darkText)
          doc.setFontSize(9)
        } else {
          const cellText = doc.splitTextToSize(String(cell), colWidths[i] - 6)[0] || ''
          doc.text(cellText, startX + 3, yPosition + 5.5)
        }
        startX += colWidths[i]
      })
      yPosition += rowHeight
    })
    yPosition += 5
  }

  // Extract data
  const {
    assist_results,
    pgsi_results,
    phq9_results,
    triggers_results,
    crisis_detected,
    demographics,
    ai_feedback
  } = results

  // ============================================================================
  // HEADER
  // ============================================================================
  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 52, 'F')

  try {
    const logoBase64 = await loadImageAsBase64('/vibeCheck_logo.png')
    const logoImgWidth = 50
    const logoImgHeight = 20
    const padX = 4
    const padY = 3
    const whiteW = logoImgWidth + padX * 2
    const whiteH = logoImgHeight + padY * 2
    const whiteX = (pageWidth - whiteW) / 2
    const whiteY = 3
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(whiteX, whiteY, whiteW, whiteH, 4, 4, 'F')
    doc.addImage(logoBase64, 'PNG', whiteX + padX, whiteY + padY, logoImgWidth, logoImgHeight)
  } catch {
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('VibeCheck', pageWidth / 2, 18, { align: 'center' })
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Screening Results', pageWidth / 2, 38, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(dateStr, pageWidth / 2, 46, { align: 'center' })

  yPosition = 60

  // ============================================================================
  // CRISIS ALERT
  // ============================================================================
  if (crisis_detected) {
    doc.setFillColor(254, 226, 226)
    doc.roundedRect(margin, yPosition, contentWidth, 22, 3, 3, 'F')
    doc.setDrawColor(...colors.red)
    doc.setLineWidth(1.5)
    doc.roundedRect(margin, yPosition, contentWidth, 22, 3, 3, 'S')
    doc.setTextColor(...colors.red)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('IMMEDIATE SUPPORT RECOMMENDED', margin + 8, yPosition + 9)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.darkText)
    doc.text('Please reach out to crisis services. See resources at the end of this report.', margin + 8, yPosition + 17)
    yPosition += 30
  }

  // ============================================================================
  // DEMOGRAPHICS
  // ============================================================================
  if (demographics) {
    addSectionTitle('Personal Information', colors.primary)
    const demoItems = []
    if (demographics.age) demoItems.push(`Age: ${demographics.age}`)
    if (demographics.gender) demoItems.push(`Gender: ${demographics.gender.replace(/_/g, ' ')}`)
    if (demographics.city || demographics.state) {
      demoItems.push(`Location: ${[demographics.city, demographics.state].filter(Boolean).join(', ')}`)
    }
    if (demographics.employment_status) {
      let emp = demographics.employment_status.replace(/_/g, ' ')
      if (demographics.employment_sector) emp += ` (${demographics.employment_sector.replace(/_/g, ' ')})`
      demoItems.push(`Employment: ${emp}`)
    }
    if (demographics.marital_status) demoItems.push(`Status: ${demographics.marital_status.replace(/_/g, ' ')}`)
    if (demographics.religion) demoItems.push(`Religion: ${demographics.religion.replace(/_/g, ' ')}`)

    addText(demoItems.join('   •   '), 10, colors.darkText)
    yPosition += 3
  }

  // ============================================================================
  // ASSIST — overall risk, per-substance table, AND per-substance harm detail
  // (this is the part the summary table alone was missing)
  // ============================================================================
  if (assist_results) {
    addSectionTitle('Substance Use Assessment (WHO ASSIST)', colors.primary)

    const overallRisk = assist_results.overall_risk || 'low'
    addRiskBadge('Overall Risk Level:', overallRisk)
    if (assist_results.brief_intervention_needed) {
      addText('Brief intervention recommended based on your responses.', 9, colors.orange, true)
    }
    yPosition += 3

    const substancesWithScores = assist_results.scores
      ? Object.entries(assist_results.scores).filter(([_, data]) => data.score > 0)
      : []

    if (substancesWithScores.length > 0) {
      // Summary table first
      addSubsectionTitle('Substance-Specific Results')
      yPosition += 3
      const headers = ['Substance', 'Score', 'Risk Level', 'Recommendation']
      const colWidths = [45, 25, 35, contentWidth - 105]
      const rows = substancesWithScores.map(([substance, data]) => {
        let substanceName = substance.charAt(0).toUpperCase() + substance.slice(1).replace(/_/g, ' ')
        if (substance === 'other' && assist_results.other_specify) {
          const custom = assist_results.other_specify.split(',').map(s => s.trim()).filter(Boolean)
          if (custom.length > 0) substanceName = custom[0]
        }
        return [
          substanceName,
          data.score.toString(),
          { text: (data.risk_level || 'low').toUpperCase(), color: getRiskColor(data.risk_level) },
          data.intervention || 'Self-monitoring'
        ]
      })
      drawTable(headers, rows, colWidths)

      // Detailed harm breakdown per substance — mirrors the ASSIST tab
      substancesWithScores.forEach(([substance, data]) => {
        let displayName = substance.replace(/_/g, ' ')
        if (substance === 'other' && assist_results.other_specify) {
          const custom = assist_results.other_specify.split(',').map(s => s.trim()).filter(Boolean)
          if (custom.length > 0) {
            displayName = custom.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
          }
        }
        const harmData = getSubstanceHarms(substance)

        checkNewPage(30)
        addSubsectionTitle(displayName.charAt(0).toUpperCase() + displayName.slice(1))
        addText(harmData.statement, 9, colors.darkText, true)
        addBulletList(harmData.harms, 8.5, colors.lightText)
        yPosition += 2
      })
    } else {
      addText('No substance use concerns identified in the past 3 months.', 10, colors.green, true)
    }

    if (assist_results.injection_use !== undefined && assist_results.injection_use > 0) {
      yPosition += 2
      checkNewPage(12)
      doc.setFillColor(254, 243, 199)
      doc.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, 'F')
      doc.setFontSize(9)
      doc.setTextColor(...colors.orange)
      doc.setFont('helvetica', 'bold')
      doc.text('Note: Injection drug use indicated - specialized support recommended', margin + 5, yPosition + 7)
      yPosition += 15
    }
  }

  // ============================================================================
  // PGSI — score, risk category, scale, description, recommendation
  // ============================================================================
  if (pgsi_results) {
    addSectionTitle('Gambling Screening (PGSI)', colors.primary)

    const pgsiScore = pgsi_results.total_score
    const pgsiCategory = pgsi_results.risk_category || 'no_risk'
    const pgsiLabelMap = {
      problem_gambler: 'PROBLEM GAMBLER',
      moderate_risk: 'MODERATE RISK',
      low_risk: 'LOW RISK',
      no_risk: 'NO RISK'
    }

    checkNewPage(35)
    doc.setFillColor(245, 245, 250)
    doc.roundedRect(margin, yPosition, 50, 24, 3, 3, 'F')
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.darkText)
    doc.text(`${pgsiScore}/27`, margin + 25, yPosition + 14, { align: 'center' })
    doc.setFontSize(7)
    doc.setTextColor(...colors.lightText)
    doc.text('PGSI Score', margin + 25, yPosition + 21, { align: 'center' })

    doc.setFillColor(...getRiskColor(pgsiCategory))
    doc.roundedRect(margin + 55, yPosition + 3, 70, 12, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(pgsiLabelMap[pgsiCategory] || pgsiCategory.toUpperCase(), margin + 90, yPosition + 11, { align: 'center' })
    yPosition += 30

    // Risk scale, mirrors the Results page scale
    addSubsectionTitle('PGSI Risk Scale')
    const scaleRows = [
      ['No Risk', '0'],
      ['Low Risk', '1–4'],
      ['Moderate Risk', '5–7'],
      ['Problem Gambler', '8+']
    ]
    scaleRows.forEach(([label, range]) => {
      checkNewPage(7)
      const isActive =
        (label === 'No Risk' && pgsiCategory === 'no_risk') ||
        (label === 'Low Risk' && pgsiCategory === 'low_risk') ||
        (label === 'Moderate Risk' && pgsiCategory === 'moderate_risk') ||
        (label === 'Problem Gambler' && pgsiCategory === 'problem_gambler')
      doc.setFontSize(9)
      doc.setFont('helvetica', isActive ? 'bold' : 'normal')
      doc.setTextColor(...(isActive ? colors.primary : colors.lightText))
      doc.text(`${isActive ? '→ ' : '   '}${label} (${range})`, margin, yPosition)
      yPosition += 6
    })
    yPosition += 3

    if (pgsi_results.risk_description) {
      addSubsectionTitle('What This Means')
      addText(pgsi_results.risk_description, 9, colors.lightText)
    }
    if (pgsi_results.recommendation) {
      addKeyValue('Recommendation', pgsi_results.recommendation)
    }
    yPosition += 4
  }

  // ============================================================================
  // PHQ-9 — score, severity, functional impairment, suicidal ideation warning
  // ============================================================================
  if (phq9_results) {
    addSectionTitle('Depression Screening (PHQ-9)', colors.primary)

    const score = phq9_results.total_score
    const maxScore = 27
    const severity = phq9_results.severity || 'minimal'

    doc.setFillColor(...colors.lightPurple)
    doc.roundedRect(margin, yPosition, 50, 25, 3, 3, 'F')
    doc.setFontSize(22)
    doc.setTextColor(...getRiskColor(severity))
    doc.setFont('helvetica', 'bold')
    doc.text(`${score}`, margin + 25, yPosition + 14, { align: 'center' })
    doc.setFontSize(9)
    doc.setTextColor(...colors.lightText)
    doc.setFont('helvetica', 'normal')
    doc.text(`out of ${maxScore}`, margin + 25, yPosition + 21, { align: 'center' })

    doc.setFontSize(12)
    doc.setTextColor(...colors.darkText)
    doc.setFont('helvetica', 'bold')
    doc.text(`${severity.replace(/_/g, ' ').toUpperCase()} Depression`, margin + 60, yPosition + 10)

    if (phq9_results.action_description) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.lightText)
      const descLines = doc.splitTextToSize(phq9_results.action_description, contentWidth - 65)
      doc.text(descLines[0] || '', margin + 60, yPosition + 18)
    }
    yPosition += 32

    // Full action description (in case it ran past one line above)
    if (phq9_results.action_description) {
      addText(phq9_results.action_description, 9, colors.darkText)
    }

    if (phq9_results.functional_impairment) {
      addKeyValue('Functional Impact', phq9_results.functional_impairment.replace(/_/g, ' '))
    }

    if (phq9_results.suicidal_ideation) {
      yPosition += 3
      checkNewPage(12)
      doc.setFillColor(254, 226, 226)
      doc.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, 'F')
      doc.setFontSize(9)
      doc.setTextColor(...colors.red)
      doc.setFont('helvetica', 'bold')
      doc.text('Important: Please discuss thoughts of self-harm with a professional', margin + 5, yPosition + 7)
      yPosition += 15
    }
  }

  // ============================================================================
  // TRIGGERS — external and internal, grouped by level, with verdict text
  // ============================================================================
  if (triggers_results && triggers_results.total_triggers > 0) {
    addSectionTitle('Triggers Assessment', colors.primary)

    addText(
      `You identified ${triggers_results.total_triggers} triggers: ${triggers_results.external_count} situational and ${triggers_results.internal_count} emotional.`,
      10, colors.darkText
    )
    if (triggers_results.pattern_description) {
      addText(triggers_results.pattern_description, 9, colors.lightText)
    }
    yPosition += 3

    const levelConfig = {
      always_use: { color: colors.red, label: 'Avoid Totally' },
      almost_always: { color: colors.orange, label: 'High Risk' },
      almost_never: { color: colors.blue, label: 'Low Risk' },
      never_use: { color: colors.green, label: 'Safe' }
    }

    const renderTriggerGroup = (title, verdicts) => {
      if (!verdicts || verdicts.length === 0) return
      addSubsectionTitle(title)
      yPosition += 2

      verdicts.forEach(verdict => {
        const config = levelConfig[verdict.level] || levelConfig.never_use
        checkNewPage(16)

        // Level badge
        doc.setFillColor(...config.color)
        const badgeText = config.label.toUpperCase()
        const badgeWidth = doc.getTextWidth(badgeText) + 8
        doc.roundedRect(margin, yPosition - 4, badgeWidth, 6.5, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(badgeText, margin + 4, yPosition)
        yPosition += 6

        // Trigger names
        const names = verdict.triggers.map(id => formatTriggerName(id)).join(', ')
        addText(names, 9, colors.darkText, false, 4)

        // Verdict sentence
        if (verdict.verdict) {
          addText(verdict.verdict, 8.5, colors.lightText, false, 4)
        }
        yPosition += 2
      })
    }

    renderTriggerGroup('Situational Triggers (External)', triggers_results.external_verdicts)
    renderTriggerGroup('Emotional Triggers (Internal)', triggers_results.internal_verdicts)
  }

  // ============================================================================
  // AI PERSONALIZED FEEDBACK
  // ============================================================================
  if (ai_feedback) {
    addSectionTitle('Personalized Insights', colors.primary)

    if (ai_feedback.overall_message) {
      addText(ai_feedback.overall_message, 10, colors.darkText)
      yPosition += 3
    }
    if (ai_feedback.assist_feedback) {
      addSubsectionTitle('Substance Use')
      addText(ai_feedback.assist_feedback, 9, colors.lightText)
      yPosition += 2
    }
    if (ai_feedback.phq9_feedback) {
      addSubsectionTitle('Mental Health')
      addText(ai_feedback.phq9_feedback, 9, colors.lightText)
      yPosition += 2
    }
    if (ai_feedback.triggers_feedback) {
      addSubsectionTitle('Triggers Awareness')
      addText(ai_feedback.triggers_feedback, 9, colors.lightText)
      yPosition += 2
    }
    if (ai_feedback.next_steps && ai_feedback.next_steps.length > 0) {
      addSubsectionTitle('Recommended Next Steps')
      ai_feedback.next_steps.forEach((step, idx) => {
        addText(`${idx + 1}. ${step}`, 9, colors.darkText, false, 5)
      })
    }

    addDivider()
    addText('Note: This feedback is AI-generated guidance, not a substitute for professional medical advice.', 8, colors.lightText)
  }

  // ============================================================================
  // CRISIS RESOURCES — new page
  // ============================================================================
  doc.addPage()
  yPosition = margin

  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Support Resources', pageWidth / 2, 16, { align: 'center' })
  yPosition = 35

  addSectionTitle('Nigerian Crisis Hotlines', colors.primary)
  const hotlines = [
    { type: 'WhatsApp & Call', number: '+234 704 652 6817' },
    { type: 'WhatsApp Only', number: '+234 812 937 8557' },
    { type: 'WhatsApp Only', number: '+234 903 989 0177' },
    { type: 'Emergency', number: '112' }
  ]
  hotlines.forEach(h => addKeyValue(h.type, h.number, colors.primary))
  yPosition += 5

  const assistRisk = assist_results?.overall_risk || 'low'
  const phq9Severity = phq9_results?.severity || 'minimal'
  const pgsiRisk = pgsi_results?.risk_category || 'no_risk'
  const showHospitals =
    ['moderate', 'high'].includes(assistRisk) ||
    ['moderate', 'moderately_severe', 'severe'].includes(phq9Severity) ||
    ['moderate_risk', 'problem_gambler'].includes(pgsiRisk) ||
    crisis_detected

  if (showHospitals) {
    addDivider()
    addSectionTitle('Mental Health Hospitals in Nigeria', colors.primary)
    addText('Government-approved facilities providing psychiatric and mental health services:', 9, colors.lightText)
    yPosition += 3

    const hospitalHeaders = ['Hospital Name', 'State', 'Type']
    const hospitalColWidths = [contentWidth * 0.55, contentWidth * 0.25, contentWidth * 0.20]

    doc.setFillColor(...colors.primary)
    doc.rect(margin, yPosition, contentWidth, 8, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    let headerX = margin
    hospitalHeaders.forEach((header, i) => {
      doc.text(header, headerX + 2, yPosition + 5.5)
      headerX += hospitalColWidths[i]
    })
    yPosition += 8

    const typeColors = {
      Federal: colors.red,
      Teaching: colors.blue,
      State: colors.primary,
      Rehabilitation: colors.green
    }

    NIGERIAN_HOSPITALS.forEach((hospital, idx) => {
      const rowHeight = hospital.address ? 11 : 7
      checkNewPage(rowHeight)
      if (idx % 2 === 0) {
        doc.setFillColor(...colors.lightBg)
        doc.rect(margin, yPosition, contentWidth, rowHeight, 'F')
      }
      doc.setDrawColor(...colors.border)
      doc.setLineWidth(0.1)
      doc.rect(margin, yPosition, contentWidth, rowHeight, 'S')

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.darkText)

      let cellX = margin
      const nameText = doc.splitTextToSize(hospital.name, hospitalColWidths[0] - 4)[0]
      doc.text(nameText, cellX + 2, yPosition + 4.5)
      if (hospital.address) {
        doc.setFontSize(6)
        doc.setTextColor(150, 150, 150)
        const addressText = doc.splitTextToSize(hospital.address, hospitalColWidths[0] - 4)[0]
        doc.text(addressText, cellX + 2, yPosition + 8.5)
        doc.setFontSize(7)
        doc.setTextColor(...colors.darkText)
      }
      cellX += hospitalColWidths[0]
      doc.text(hospital.state, cellX + 2, yPosition + 4.5)
      cellX += hospitalColWidths[1]
      doc.setTextColor(...(typeColors[hospital.type] || colors.darkText))
      doc.text(hospital.type, cellX + 2, yPosition + 4.5)

      yPosition += rowHeight
    })

    yPosition += 5
    addText(
      'Federal = Federal Neuro-Psychiatric Hospitals | Teaching = University Teaching Hospitals | State = State Psychiatric Hospitals | Rehabilitation = Nigeria Counselling & Rehabilitation Centres',
      7, colors.lightText
    )
  }

  yPosition += 5
  addDivider()
  addSectionTitle('Important Notes', colors.primary)
  const notes = [
    'This screening is not a diagnosis. Please consult with a licensed mental health professional.',
    'Results are based on your self-reported responses and should be discussed with a healthcare provider.',
    'For immediate crisis support, contact the hotlines above or visit the nearest hospital emergency.',
    'This report is confidential. Keep it in a safe place.'
  ]
  addBulletList(notes, 9, colors.lightText, 0)

  // ============================================================================
  // FOOTERS
  // ============================================================================
  addPageFooter()
  doc.setPage(1)
  addPageFooter()

  // ============================================================================
  // SAVE
  // ============================================================================
  const fileName = `Screening_Report_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
