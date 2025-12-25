import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import jsPDF from 'jspdf'

const API_BASE = 'http://localhost:8000/api'

function Report({ darkMode, setDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
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
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPos = margin

    // Title
    doc.setFontSize(20)
    doc.text('Interview Practice Report', margin, yPos)
    yPos += 15

    // Role
    doc.setFontSize(14)
    doc.text(`Role: ${report.role}`, margin, yPos)
    yPos += 10

    // Score
    doc.setFontSize(12)
    doc.text(`Average Score: ${report.average_score.toFixed(1)}/10`, margin, yPos)
    yPos += 10

    // Overall Tone
    doc.text(`Overall Tone: ${report.overall_tone}`, margin, yPos)
    yPos += 10

    // Filler Words
    doc.text(`Total Filler Words: ${report.total_filler_words}`, margin, yPos)
    yPos += 15

    // Score Breakdown
    doc.setFontSize(14)
    doc.text('Score Breakdown', margin, yPos)
    yPos += 10
    doc.setFontSize(12)
    doc.text(`Min: ${report.score_breakdown.min}`, margin, yPos)
    yPos += 7
    doc.text(`Max: ${report.score_breakdown.max}`, margin, yPos)
    yPos += 7
    doc.text(`Average: ${report.score_breakdown.average.toFixed(1)}`, margin, yPos)
    yPos += 15

    // Improvement Tips
    doc.setFontSize(14)
    doc.text('Improvement Tips', margin, yPos)
    yPos += 10
    doc.setFontSize(11)
    report.improvement_tips.forEach((tip, index) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = margin
      }
      doc.text(`${index + 1}. ${tip}`, margin, yPos)
      yPos += 7
    })

    // Responses
    yPos += 10
    if (yPos > 250) {
      doc.addPage()
      yPos = margin
    }
    doc.setFontSize(14)
    doc.text('Question Responses', margin, yPos)
    yPos += 10

    report.responses.forEach((item, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = margin
      }
      doc.setFontSize(12)
      doc.text(`Q${index + 1}: ${item.question.substring(0, 60)}...`, margin, yPos)
      yPos += 7
      doc.setFontSize(10)
      doc.text(`Score: ${item.feedback.score}/10`, margin + 5, yPos)
      yPos += 10
    })

    doc.save(`interview-report-${report.role}-${Date.now()}.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading report...</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load report</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          Interview Report
        </h1>
        <div className="flex gap-4">
          <button
            onClick={exportToPDF}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-colors"
          >
            🏠 Home
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Performance Summary
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {report.average_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {report.answered_questions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {report.total_filler_words}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Filler Words</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2 capitalize">
                    {report.overall_tone}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Tone</div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Score Breakdown
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {report.score_breakdown.max}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Highest Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {report.score_breakdown.average.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {report.score_breakdown.min}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lowest Score</div>
                </div>
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Improvement Tips
              </h3>
              <ul className="space-y-3">
                {report.improvement_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">
                      {index + 1}.
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Detailed Responses
              </h3>
              <div className="space-y-6">
                {report.responses.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-primary-600 pl-6 py-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Question {index + 1}
                      </h4>
                      <div className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold">
                        {item.feedback.score}/10
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{item.question}</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 italic">
                      "{item.response}"
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tone: <span className="font-semibold capitalize">{item.feedback.tone}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Filler Words: <span className="font-semibold">{item.feedback.filler_words_count}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Clarity: <span className="font-semibold capitalize">{item.feedback.clarity}</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Report

