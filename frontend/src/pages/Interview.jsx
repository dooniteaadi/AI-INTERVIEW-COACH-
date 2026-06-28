import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import VoiceRecorder from '../components/VoiceRecorder'
import FeedbackCard from '../components/FeedbackCard'

const API_BASE = 'http://localhost:8000/api'

// SVG Speaking Avatar Component
function InterviewerAvatar({ mode, isSpeaking }) {
  const getColors = () => {
    switch (mode) {
      case 'technical':
        return {
          glow: 'from-blue-500 to-cyan-500 shadow-cyan-500/20',
          bg: 'bg-slate-900 border-cyan-500/50',
          accent: 'fill-cyan-400',
          pulse: 'bg-cyan-500',
          name: 'Tech Lead Tyler'
        }
      case 'challenging':
        return {
          glow: 'from-amber-500 to-orange-500 shadow-amber-500/20',
          bg: 'bg-slate-900 border-amber-500/50',
          accent: 'fill-amber-400',
          pulse: 'bg-amber-500',
          name: 'Savage Critic Sam'
        }
      case 'pressure':
        return {
          glow: 'from-rose-500 to-red-600 shadow-rose-500/20',
          bg: 'bg-slate-900 border-rose-500/50',
          accent: 'fill-rose-400',
          pulse: 'bg-rose-500',
          name: 'Pressure Tester Paula'
        }
      case 'friendly':
      default:
        return {
          glow: 'from-emerald-500 to-teal-500 shadow-emerald-500/20',
          bg: 'bg-slate-900 border-emerald-500/50',
          accent: 'fill-emerald-400',
          pulse: 'bg-emerald-500',
          name: 'Friendly Coach Fiona'
        }
    }
  }

  const colors = getColors()

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative">
        {/* Ambient Ring Glow */}
        <motion.div
          animate={isSpeaking ? { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] } : { scale: 1, opacity: 0.3 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className={`absolute inset-[-8px] rounded-full bg-gradient-to-tr ${colors.glow} blur-md`}
        />
        
        {/* Main Avatar Circular Frame */}
        <div className={`w-28 h-28 rounded-full border-2 ${colors.bg} flex items-center justify-center relative z-10 shadow-inner overflow-hidden`}>
          <svg className="w-16 h-16 text-slate-300" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Robot Head */}
            <rect x="16" y="20" width="32" height="24" rx="8" className="stroke-current stroke-2 fill-slate-800" />
            {/* Neck */}
            <path d="M28 44V50H36V44" className="stroke-current stroke-2" />
            {/* Ears/Antennas */}
            <rect x="10" y="28" width="6" height="8" rx="2" className="stroke-current fill-slate-700" />
            <rect x="48" y="28" width="6" height="8" rx="2" className="stroke-current fill-slate-700" />
            <path d="M32 20V12H38" className="stroke-current stroke-2" />
            <circle cx="38" cy="12" r="3" className={colors.accent} />
            
            {/* Eyes */}
            <motion.circle
              cx="26"
              cy="30"
              r="3.5"
              className={colors.accent}
              animate={isSpeaking ? { scaleY: [1, 0.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
            <motion.circle
              cx="38"
              cy="30"
              r="3.5"
              className={colors.accent}
              animate={isSpeaking ? { scaleY: [1, 0.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />

            {/* Speaking Mouth/Visualizer */}
            {isSpeaking ? (
              <motion.path
                d="M24 38 H40"
                className="stroke-current"
                strokeWidth="3.5"
                strokeLinecap="round"
                animate={{ d: ["M24 38 H40", "M24 38 Q32 44 40 38", "M24 38 H40"] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            ) : (
              <path d="M26 38 Q32 40 38 38" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </div>

        {/* Pulse Indicator */}
        {isSpeaking && (
          <span className="absolute bottom-1 right-1 flex h-4 w-4 z-20">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.pulse} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-4 w-4 ${colors.pulse}`}></span>
          </span>
        )}
      </div>
      
      <span className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-primary-500 animate-pulse' : 'bg-slate-400'}`} />
        {colors.name}
      </span>
    </div>
  )
}

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
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Advanced features state variables
  const [pressureMode] = useState(location.state?.pressureMode || false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [timerActive, setTimerActive] = useState(false)
  const [currentVolumeData, setCurrentVolumeData] = useState([])

  useEffect(() => {
    if (!role) {
      navigate('/')
      return
    }
    initializeSession()
  }, [role])

  // Reset/configure countdown timer for Pressure Mode
  useEffect(() => {
    if (pressureMode && questions.length > 0 && !feedback && !loading) {
      setTimeLeft(60)
      setTimerActive(true)
    } else {
      setTimerActive(false)
    }
  }, [currentQuestionIndex, questions, feedback, loading, pressureMode])

  useEffect(() => {
    let interval = null
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
      // Auto-submit current answer (with fallback text if empty)
      const forcedText = response.trim() ? response : "[No response submitted within 60s limit]"
      setResponse(forcedText)
      handleSubmitResponse(forcedText)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const initializeSession = async () => {
    // FIX: Properly register custom questions on the backend so /response endpoint has session context.
    if (location.state?.customQuestions) {
      try {
        const response = await axios.post(`${API_BASE}/session`, {
          role: role || 'Custom Role',
          question_count: location.state.customQuestions.length,
          custom_questions: location.state.customQuestions,
          strategy: "static"
        })
        setSessionId(response.data.session_id)
        setQuestions(response.data.questions)
      } catch (error) {
        console.error('Failed to initialize session with custom questions:', error)
        setQuestions(location.state.customQuestions)
        setSessionId('custom-' + Date.now())
      }
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
      utterance.rate = 0.95 // Slightly slower for clearer speech
      utterance.pitch = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e)
        setIsSpeaking(false)
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const timer = setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex])
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [currentQuestionIndex, questions])

  const handleSubmitResponse = async (forcedResponse = null) => {
    const finalResponse = forcedResponse || response;
    if (!finalResponse.trim()) {
      alert('Please provide a response')
      return
    }

    setLoading(true)
    setIsSpeaking(false)
    setTimerActive(false)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    try {
      const question = questions[currentQuestionIndex]
      const result = await axios.post(
        `${API_BASE}/session/${sessionId}/response`,
        {
          question,
          response: finalResponse,
          mode
        }
      )

      setFeedback(result.data.feedback)
      setResponses([...responses, {
        question,
        response: finalResponse,
        feedback: result.data.feedback,
        volumeData: currentVolumeData
      }])
    } catch (error) {
      console.error('Failed to submit response:', error)
      let errorMessage = error.response?.data?.detail || error.message || 'Failed to get feedback. Please try again.'
      if (errorMessage.includes('API_KEY') || errorMessage.includes('key') || errorMessage.includes('quota') || errorMessage.includes('model')) {
        errorMessage += '\n\nPlease check your Gemini API key in backend/.env or your Google AI Studio quota limits.'
      }
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = () => {
    const currentResponses = [...responses]
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setResponse('')
      setFeedback(null)
      setCurrentVolumeData([])
    } else {
      navigate('/report', {
        state: {
          sessionId,
          role,
          responses: currentResponses
        }
      })
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
      {/* Ambient Blur Blobs */}
      <div className="glow-blob w-[30rem] h-[30rem] top-[-5rem] left-[-5rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="glow-blob w-[25rem] h-[25rem] bottom-[-5rem] right-[-5rem] bg-violet-500/10 dark:bg-violet-600/10 rounded-full blur-[100px]" />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800/60 glass-panel">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500 block mb-0.5">
            Active Session {pressureMode && '• ⏱️ Pressure Mode Active'}
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Practice for <span className="text-primary-600 dark:text-primary-400 font-extrabold">{role}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-all duration-300 active:scale-95"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800/50 relative z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="glass-panel rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/80"
              >
                {/* Resume Roast Section */}
                {location.state?.roast && currentQuestionIndex === 0 && !response && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-6 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 dark:border-red-500/10 rounded-2xl"
                  >
                    <h3 className="text-sm uppercase font-bold text-red-500 flex items-center gap-1.5 mb-2">
                      🔥 Resume Roast Critique
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-350 italic leading-relaxed">
                      "{location.state.roast}"
                    </p>
                  </motion.div>
                )}

                {/* Speaker Coach Avatar */}
                <InterviewerAvatar mode={mode} isSpeaking={isSpeaking} />

                {/* Pressure Mode Timer */}
                {pressureMode && timerActive && (
                  <div className="flex justify-center items-center my-4">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className="stroke-slate-200 dark:stroke-slate-800/60"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          className={
                            timeLeft >= 30 
                              ? 'stroke-emerald-500' 
                              : timeLeft >= 15 
                              ? 'stroke-amber-500' 
                              : 'stroke-rose-500 animate-pulse'
                          }
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          animate={{ strokeDashoffset: (2 * Math.PI * 40) - (timeLeft / 60) * (2 * Math.PI * 40) }}
                          transition={{ duration: 1, ease: "linear" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className={`text-xl font-extrabold ${
                          timeLeft >= 30 
                            ? 'text-emerald-500' 
                            : timeLeft >= 15 
                            ? 'text-amber-500' 
                            : 'text-rose-500 font-black animate-pulse'
                        }`}>
                          {timeLeft}s
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Text Box */}
                <div className="p-6 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex justify-between items-start gap-4 mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex-1 leading-snug">
                    {currentQuestion || "Formulating next question..."}
                  </h2>
                  <button
                    onClick={() => speakQuestion(currentQuestion)}
                    disabled={!currentQuestion}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-lg transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50"
                    title="Read Question Aloud"
                  >
                    🔊
                  </button>
                </div>

                {/* Interviewer Personality Trait Selector */}
                <div className="grid grid-cols-4 gap-2 mb-8">
                  {[
                    { val: 'friendly', label: '😊 Fiona', desc: 'Friendly Coach' },
                    { val: 'technical', label: '💻 Tyler', desc: 'Technical Lead' },
                    { val: 'challenging', label: '🔥 Sam', desc: 'Savage Critic' },
                    { val: 'pressure', label: '⏱️ Paula', desc: 'Pressure Tester' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setMode(item.val)}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                        mode === item.val
                          ? 'border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-400 font-bold shadow-md shadow-primary-500/5'
                          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[9px] text-slate-400 font-normal mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Input Method Toggle */}
                <div className="mb-6 flex p-1 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                  <button
                    onClick={() => setUseVoice(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                      !useVoice
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    📝 Keyboard Input
                  </button>
                  <button
                    onClick={() => setUseVoice(true)}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                      useVoice
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    🎤 Voice Input
                  </button>
                </div>

                {/* Input Fields */}
                {useVoice ? (
                  <VoiceRecorder
                    onTranscript={(text) => setResponse(text)}
                    onVolumeData={(volumeList) => setCurrentVolumeData(volumeList)}
                    darkMode={darkMode}
                  />
                ) : (
                  <div className="relative">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your structured professional answer here..."
                      className="w-full h-48 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-300"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {response.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                )}

                {/* Submit Response */}
                <button
                  onClick={() => handleSubmitResponse()}
                  disabled={!response.trim() || loading}
                  className={`w-full mt-8 py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    response.trim() && !loading
                      ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-lg shadow-primary-500/20 active:scale-[0.99] cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing Your Speech Patterns...</span>
                    </>
                  ) : (
                    <span>Submit & Get Instant Feedback</span>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <FeedbackCard feedback={feedback} darkMode={darkMode} />
                <button
                  onClick={handleNextQuestion}
                  className="w-full mt-8 py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all duration-300 active:scale-[0.99]"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Proceed to Next Question' : 'Generate Comprehensive Final Report'}
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


