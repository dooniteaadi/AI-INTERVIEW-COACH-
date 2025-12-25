import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import RoleSelector from '../components/RoleSelector'

function Landing({ darkMode, setDarkMode }) {
  const [selectedRole, setSelectedRole] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [roastMode, setRoastMode] = useState(false)
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
            roast: data.roast
          }
        })
      } catch (error) {
        console.error('Error uploading resume:', error)
        alert('Failed to analyze resume. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      navigate('/interview', { state: { role: selectedRole } })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          AI Interview Coach
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
            >
              Master Your Next Interview
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              Practice with AI-powered feedback on clarity, tone, and confidence
            </motion.p>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {[
              {
                icon: '🎯',
                title: 'Role-Specific Questions',
                description: 'Practice with questions tailored to your target role'
              },
              {
                icon: '🤖',
                title: 'AI-Powered Feedback',
                description: 'Get instant feedback on tone, clarity, and filler words'
              },
              {
                icon: '📊',
                title: 'Detailed Reports',
                description: 'Track your progress with comprehensive performance reports'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Role Selection & Resume Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Role Selection */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                  Select Your Role
                </h2>
                <RoleSelector
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                />
              </div>

              {/* Right Column: Resume Upload */}
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-8 md:pt-0 md:pl-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                  Upload Resume (Optional)
                </h2>

                <div className="space-y-4">
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-gray-500 dark:text-gray-400">
                      {resumeFile ? (
                        <span className="text-primary-600 font-medium">{resumeFile.name}</span>
                      ) : (
                        <>
                          <span className="block text-2xl mb-2">📄</span>
                          <span>Drop PDF resume here or click to upload</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Roast Mode Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">🔥 Roast My Resume</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Get a brutal critique before starting</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roastMode}
                        onChange={(e) => setRoastMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={(!selectedRole && !resumeFile) || loading}
              className={`w-full mt-8 py-4 px-6 rounded-lg font-semibold text-white transition-all ${(selectedRole || resumeFile) && !loading
                ? 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {loading ? 'Analyzing Resume...' : 'Start Interview Practice'}
            </button>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
              How It Works
            </h2>
            <div className="space-y-4">
              {[
                'Choose your target role from the dropdown above',
                'Answer 5-10 role-specific interview questions',
                'Get instant AI feedback on your responses',
                'Review your performance report and improvement tips'
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default Landing

