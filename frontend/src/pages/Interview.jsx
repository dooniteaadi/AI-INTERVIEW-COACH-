import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import VoiceRecorder from '../components/VoiceRecorder'
import FeedbackCard from '../components/FeedbackCard'

const API_BASE = 'http://localhost:8000/api'

function Interview({ darkMode, setDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [role, setRole] = useState(location.state?.role || '')
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [mode, setMode] = useState('friendly')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [responses, setResponses] = useState([])
  const [useVoice, setUseVoice] = useState(false)

  useEffect(() => {
    if (!role) {
      navigate('/')
      return
    }
    initializeSession()
  }, [role])

  const initializeSession = async () => {
    // If we have custom questions from resume upload, use them
    if (location.state?.customQuestions) {
      setQuestions(location.state.customQuestions)
      setSessionId('custom-' + Date.now()) // Temporary ID for custom sessions
      return
    }

    try {
      const response = await axios.post(`${API_BASE}/session`, {
        role,
        question_count: 5
      })
      setSessionId(response.data.session_id)
      setQuestions(response.data.questions)
    } catch (error) {
      console.error('Failed to initialize session:', error)
      alert('Failed to start interview session')
    }
  }

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop previous speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      // Small delay to ensure transition is done
      setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex])
      }, 500)
    }
  }, [currentQuestionIndex, questions])

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      alert('Please provide a response')
      return
    }

    setLoading(true)
    try {
      const question = questions[currentQuestionIndex]
      const result = await axios.post(
        `${API_BASE}/session/${sessionId}/response`,
        {
          question,
          response,
          mode
        }
      )

      setFeedback(result.data.feedback)
      setResponses([...responses, {
        question,
        response,
        feedback: result.data.feedback
      }])

      // Move to next question after showing feedback
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setResponse('')
          setFeedback(null)
        } else {
          // Interview complete
          navigate('/report', {
            state: {
              sessionId, role, responses: [...responses, {
                question,
                response,
                feedback: result.data.feedback
              }]
            }
          })
        }
      }, 3000)
    } catch (error) {
      console.error('Failed to submit response:', error)
      let errorMessage = error.response?.data?.detail || error.message || 'Failed to get feedback. Please try again.'

      // Provide helpful message for quota errors
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
        errorMessage += '\n\nPlease check your OpenAI account billing at:\nhttps://platform.openai.com/account/billing'
      }

      console.error('Error details:', error.response?.data)
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setResponse('')
      setFeedback(null)
    } else {
      navigate('/report', { state: { sessionId, role, responses } })
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            AI Interview Coach
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {role} • Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="h-full bg-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
              >
                {/* Roast Display */}
                {location.state?.roast && currentQuestionIndex === 0 && !response && (
                  <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">🔥 Resume Roast</h3>
                    <p className="text-gray-700 dark:text-gray-300 italic">"{location.state.roast}"</p>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex-1">
                    {currentQuestion}
                  </h2>
                  <button
                    onClick={() => speakQuestion(currentQuestion)}
                    className="ml-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Read Question"
                  >
                    🔊
                  </button>
                </div>

                {/* Interview Mode Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Interviewer Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="technical">Technical</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>

                {/* Input Method Toggle */}
                <div className="mb-6 flex gap-4">
                  <button
                    onClick={() => setUseVoice(false)}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${!useVoice
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    📝 Text Input
                  </button>
                  <button
                    onClick={() => setUseVoice(true)}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${useVoice
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    🎤 Voice Input
                  </button>
                </div>

                {/* Response Input */}
                {useVoice ? (
                  <VoiceRecorder
                    onTranscript={(text) => setResponse(text)}
                    darkMode={darkMode}
                  />
                ) : (
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full h-48 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitResponse}
                  disabled={!response.trim() || loading}
                  className={`w-full mt-6 py-4 px-6 rounded-lg font-semibold text-white transition-all ${response.trim() && !loading
                    ? 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  {loading ? 'Analyzing...' : 'Submit Response'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <FeedbackCard feedback={feedback} darkMode={darkMode} />
                <button
                  onClick={handleNextQuestion}
                  className="w-full mt-6 py-4 px-6 rounded-lg font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Final Report'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default Interview

