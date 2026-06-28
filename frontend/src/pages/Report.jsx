import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import jsPDF from 'jspdf'

const API_BASE = 'http://localhost:8000/api'

function Report({ darkMode, setDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState(0) // Default expand the first response
  const { sessionId, role, responses: initialResponses } = location.state || {}

  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }
    fetchReport()
  }, [sessionId])

  const fetchReport = async () => {
    try {
      if (initialResponses) {
        // Use provided responses to generate report
        const scores = initialResponses.map(r => r.feedback.score)
        const totalFillerWords = initialResponses.reduce((sum, r) => sum + r.feedback.filler_words_count, 0)
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
        const tones = initialResponses.map(r => r.feedback.tone)
        const mostCommonTone = tones.sort((a, b) =>
          tones.filter(v => v === a).length - tones.filter(v => v === b).length
        ).pop()

        const allTips = initialResponses.flatMap(r => r.feedback.improvement_tips)
        const uniqueTips = [...new Set(allTips)]

        setReport({
          role,
          total_questions: initialResponses.length,
          answered_questions: initialResponses.length,
          average_score: avgScore,
          overall_tone: mostCommonTone,
          total_filler_words: totalFillerWords,
          responses: initialResponses,
          improvement_tips: uniqueTips.slice(0, 5),
          score_breakdown: {
            min: Math.min(...scores),
            max: Math.max(...scores),
            average: avgScore
          }
        })
      } else {
        const response = await axios.get(`${API_BASE}/session/${sessionId}/report`)
        setReport(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
      alert('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    if (!report) return

    const doc = new jsPDF()
    const margin = 20
    let yPos = margin

    // Document header styled with deep primary color
    doc.setFillColor(79, 70, 229) // Indigo-600
    doc.rect(0, 0, 210, 45, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('INTERVIEW PRACTICE REPORT', margin, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Role: ${report.role}`, margin, 32)
    
    yPos = 55
    doc.setTextColor(30, 41, 59) // Slate-800

    // Summary block
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Performance Summary', margin, yPos)
    yPos += 10
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`• Overall Interview Score: ${report.average_score.toFixed(1)} / 10`, margin + 5, yPos)
    yPos += 7
    doc.text(`• Total Answering Duration: ${report.answered_questions} questions answered`, margin + 5, yPos)
    yPos += 7
    doc.text(`• Overall Speech Tone: ${report.overall_tone.toUpperCase()}`, margin + 5, yPos)
    yPos += 7
    doc.text(`• Total Verbal Crutches / Filler Words: ${report.total_filler_words} detected`, margin + 5, yPos)
    yPos += 15

    // Score breakdown block
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('Score Details', margin, yPos)
    yPos += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`- Highest Question Score: ${report.score_breakdown.max} / 10`, margin + 5, yPos)
    yPos += 7
    doc.text(`- Lowest Question Score:  ${report.score_breakdown.min} / 10`, margin + 5, yPos)
    yPos += 7
    doc.text(`- Combined Mean Average:  ${report.score_breakdown.average.toFixed(1)} / 10`, margin + 5, yPos)
    yPos += 15

    // Improvement Tips Block
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('Coach Guidelines & Tips', margin, yPos)
    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    report.improvement_tips.forEach((tip, index) => {
      const splitTip = doc.splitTextToSize(`${index + 1}. ${tip}`, 170)
      splitTip.forEach(line => {
        if (yPos > 275) {
          doc.addPage()
          yPos = margin
        }
        doc.text(line, margin + 5, yPos)
        yPos += 6
      })
      yPos += 2
    })
    
    // Responses Block
    yPos += 10
    if (yPos > 240) {
      doc.addPage()
      yPos = margin
    }
    
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('Response Transcript & Evaluations', margin, yPos)
    yPos += 12

    report.responses.forEach((item, index) => {
      if (yPos > 230) {
        doc.addPage()
        yPos = margin
      }
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Q${index + 1}: ${item.question}`, margin, yPos)
      yPos += 6
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'oblique')
      const splitResponse = doc.splitTextToSize(`Candidate: "${item.response}"`, 170)
      splitResponse.forEach(line => {
        if (yPos > 275) {
          doc.addPage()
          yPos = margin
        }
        doc.text(line, margin + 5, yPos)
        yPos += 5
      })
      yPos += 2

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Score: ${item.feedback.score}/10  |  Tone: ${item.feedback.tone}  |  Crutches: ${item.feedback.filler_words_count}`, margin + 5, yPos)
      yPos += 12
    })

    doc.save(`interview-report-${report.role.replace(/\s+/g, '-')}-${Date.now()}.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-bold text-lg">Assembling Your Report...</span>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="text-center p-8 glass-panel rounded-2xl max-w-sm">
          <span className="text-4xl block mb-3">⚠️</span>
          <h3 className="text-lg font-bold text-rose-500 mb-2">Failed to load report</h3>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
      {/* Decorative Blur Blobs */}
      <div className="glow-blob w-[40rem] h-[40rem] top-[-15rem] left-[-15rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
      <div className="glow-blob w-[30rem] h-[30rem] bottom-[-10rem] right-[-10rem] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800/60 glass-panel">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500 block mb-0.5">
            Practice Complete
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Interview Analytics
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToPDF}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-primary-500/15 transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>📄</span> Export PDF
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold text-sm transition-all duration-300 active:scale-95 cursor-pointer"
          >
            🏠 Home
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-all duration-300 active:scale-95"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Summary Row */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Average Score', value: `${report.average_score.toFixed(1)} / 10`, icon: '🏆', color: 'text-primary-500' },
              { title: 'Questions Answered', value: report.answered_questions, icon: '💬', color: 'text-emerald-500' },
              { title: 'Filler Words', value: report.total_filler_words, icon: '⚠️', color: report.total_filler_words > 5 ? 'text-amber-500' : 'text-slate-500' },
              { title: 'Overall Tone', value: report.overall_tone, icon: '🗣️', color: 'text-indigo-500', capitalize: true }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-2xl glass-card flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    {stat.title}
                  </span>
                  <span className={`text-2xl font-extrabold ${stat.color} ${stat.capitalize ? 'capitalize' : ''}`}>
                    {stat.value}
                  </span>
                </div>
                <span className="text-3xl w-12 h-12 bg-slate-100 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 rounded-xl flex items-center justify-center">
                  {stat.icon}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column: Score Breakdown & Tips */}
            <div className="md:col-span-1 space-y-6">
              {/* Score breakdown card */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40"
              >
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📊</span> Score Range
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                      <span>Highest Score</span>
                      <span className="font-extrabold text-emerald-500">{report.score_breakdown.max} / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${report.score_breakdown.max * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                      <span>Mean Average</span>
                      <span className="font-extrabold text-primary-500">{report.score_breakdown.average.toFixed(1)} / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500" style={{ width: `${report.score_breakdown.average * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                      <span>Lowest Score</span>
                      <span className="font-extrabold text-rose-500">{report.score_breakdown.min} / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${report.score_breakdown.min * 10}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Coaching guideline tips card */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40"
              >
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📈</span> Coach Guidelines
                </h3>
                <ul className="space-y-4">
                  {report.improvement_tips.map((tip, index) => (
                    <li key={index} className="flex gap-3 text-xs leading-relaxed font-light text-slate-600 dark:text-slate-400">
                      <span className="w-5 h-5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Right Column: Interactive Accordion of detailed responses */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📝</span> Detailed Transcript & Evaluations
              </h3>
              
              <div className="space-y-4">
                {report.responses.map((item, index) => {
                  const isExpanded = expandedIndex === index
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/10 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 pr-4">
                          <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 block mb-1">
                            Question {index + 1}
                          </span>
                          <span className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {item.question}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                            item.feedback.score >= 8
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : item.feedback.score >= 6
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {item.feedback.score}/10
                          </span>
                          <span className="text-slate-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="border-t border-slate-200/60 dark:border-slate-800/60 overflow-hidden"
                          >
                            <div className="p-6 bg-slate-100/20 dark:bg-slate-900/30 space-y-4">
                              <div>
                                <h5 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1.5">
                                  Your Submitted Answer
                                </h5>
                                <p className="text-sm text-slate-700 dark:text-slate-350 italic font-light leading-relaxed">
                                  "{item.response}"
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 text-xs">
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Tone Analysis</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{item.feedback.tone}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Filler Words</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.feedback.filler_words_count} count</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Grammar Clarity</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{item.feedback.clarity}</span>
                                </div>
                              </div>

                              <div className="pt-2">
                                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 block mb-2">
                                  Coach Evaluation
                                </span>
                                <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-light mb-4">
                                  {item.feedback.summary}
                                </p>
                              </div>

                              {/* Speech Volume Profile Chart */}
                              {item.volumeData && item.volumeData.length > 0 && (
                                <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                                  <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 block mb-3">
                                    🎤 Speech Amplitude & Pace (Voice Profile)
                                  </span>
                                  <div className="w-full h-24 bg-slate-950/80 border border-slate-200/20 dark:border-slate-800/40 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
                                    <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                                      {/* Render Grid Lines */}
                                      <line x1="0" y1="25" x2="500" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                                      <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                                      <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                                      
                                      {/* Volume Path */}
                                      <path
                                        d={`M ${item.volumeData.map((vol, idx) => {
                                          const x = (idx / (item.volumeData.length - 1)) * 500
                                          const y = 100 - (vol / 100) * 85
                                          return `${x} ${y}`
                                        }).join(' L ')}`}
                                        fill="none"
                                        stroke="#8b5cf6"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      
                                      {/* Fill Path underneath */}
                                      <path
                                        d={`M 0 100 L ${item.volumeData.map((vol, idx) => {
                                          const x = (idx / (item.volumeData.length - 1)) * 500
                                          const y = 100 - (vol / 100) * 85
                                          return `${x} ${y}`
                                        }).join(' L ')} L 500 100 Z`}
                                        fill="url(#grad)"
                                        opacity="0.15"
                                      />
                                      <defs>
                                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                          <stop offset="0%" stopColor="#8b5cf6" />
                                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                        </linearGradient>
                                      </defs>
                                    </svg>
                                    <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 select-none z-10">
                                      <span>Start of Answer</span>
                                      <span>Speaking Pace & Dynamics</span>
                                      <span>End of Answer</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}

export default Report


