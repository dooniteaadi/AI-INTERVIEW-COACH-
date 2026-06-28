import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import RoleSelector from '../components/RoleSelector'

function Landing({ darkMode, setDarkMode }) {
  const [selectedRole, setSelectedRole] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [roastMode, setRoastMode] = useState(false)
  const [pressureMode, setPressureMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleStartInterview = async () => {
    if (!selectedRole && !resumeFile) return

    if (resumeFile) {
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('file', resumeFile)
        formData.append('role', selectedRole || 'General')
        formData.append('roast_mode', roastMode)

        // Upload resume and get questions/roast
        const response = await fetch('http://localhost:8000/api/upload-resume', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error('Upload failed')

        const data = await response.json()

        navigate('/interview', {
          state: {
            role: selectedRole || 'Custom Role',
            customQuestions: data.questions,
            roast: data.roast,
            pressureMode: pressureMode
          }
        })
      } catch (error) {
        console.error('Error uploading resume:', error)
        alert('Failed to analyze resume. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      navigate('/interview', {
        state: {
          role: selectedRole,
          pressureMode: pressureMode
        }
      })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
      {/* Decorative Blur Blobs */}
      <div className="glow-blob w-[40rem] h-[40rem] top-[-10rem] left-[-10rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
      <div className="glow-blob w-[30rem] h-[30rem] bottom-[-5rem] right-[-5rem] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
            🎯
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-300 bg-clip-text text-transparent">
            InterviewCoach.ai
          </span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-xl glass-panel hover:bg-slate-100 dark:hover:bg-slate-800/80 text-lg transition-all duration-300 active:scale-95"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 mb-4 border border-primary-200/50 dark:border-primary-800/30">
              ⚡ Practice & Succeed with AI
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white leading-[1.1]"
          >
            Master Your Next <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Job Interview
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Get real-time feedback on clarity, confidence, tone, and filler words. Elevate your performance with tailored practice.
          </motion.p>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative border border-slate-200/60 dark:border-slate-800/80 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-10">
            {/* Left Column: Role Selector */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💼</span> Choose a Target Role
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Select a predefined job role. We will generate questions tailored to the position.
                </p>
                <RoleSelector
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                />
              </div>
              
              <div className="mt-8 hidden md:block">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="text-primary-500 text-lg">✓</span> Fully confidential resume parsing
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm mt-1">
                  <span className="text-primary-500 text-lg">✓</span> Immediate performance breakdown
                </div>
              </div>
            </div>

            {/* Right Column: Resume Upload */}
            <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-8 md:pt-0 md:pl-10">
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                <span>📄</span> Upload PDF Resume (Optional)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Parse your resume to generate hyper-specific questions based on your experience.
              </p>

              <div className="space-y-6">
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 bg-slate-50/50 dark:bg-slate-900/30 group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center">
                    {resumeFile ? (
                      <div className="space-y-2">
                        <span className="block text-4xl">✅</span>
                        <span className="block font-semibold text-primary-600 dark:text-primary-400 text-sm">
                          {resumeFile.name}
                        </span>
                        <span className="block text-xs text-slate-400">
                          Click to change file
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-2xl text-slate-500 dark:text-slate-400">📥</span>
                        </div>
                        <span className="block font-medium text-slate-700 dark:text-slate-300 text-sm mb-1">
                          Drag & drop your PDF resume here
                        </span>
                        <span className="block text-xs text-slate-400">
                          or click to browse from device (PDF max 5MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Roast Mode Toggle */}
                <div className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-xl">
                  <div className="pr-4">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      🔥 Roast My Resume
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Get a savage, humorous critique of your resume before starting.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={roastMode}
                      onChange={(e) => setRoastMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Pressure Mode Toggle */}
                <div className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-xl">
                  <div className="pr-4">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      ⏱️ Pressure Mode (60s Limit)
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Enforce a 60-second limit on each question to test quick thinking.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={pressureMode}
                      onChange={(e) => setPressureMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={(!selectedRole && !resumeFile) || loading}
            className={`w-full mt-10 py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              (selectedRole || resumeFile) && !loading
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-lg shadow-primary-500/20 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Resume and Formatting Questions...</span>
              </>
            ) : (
              <>
                <span>🚀 Start Your Interview Session</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Features List */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: '🎯',
              title: 'Role-Specific Practicing',
              description: 'Access specific mock databases for Engineering, Product, Marketing, Design, and and DevOps.'
            },
            {
              icon: '🤖',
              title: 'Deep Gemini Analytics',
              description: 'Receive rich reports breaking down your grammar clarity, speaking confidence, and filler word density.'
            },
            {
              icon: '📊',
              title: 'Detailed Performance reports',
              description: 'Review overall performance scores, print physical progress PDF certificates, and analyze detailed feedback.'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="p-6 rounded-2xl glass-card border border-slate-200/50 dark:border-slate-800/40"
            >
              <div className="text-3xl mb-4 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                {feature.icon}
              </div>
              <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">
                {feature.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 relative z-10">
        © 2026 InterviewCoach.ai. Powered by Gemini-2.5-flash. All rights reserved.
      </footer>
    </div>
  )
}

export default Landing


