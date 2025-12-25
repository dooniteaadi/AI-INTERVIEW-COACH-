import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function VoiceRecorder({ onTranscript, darkMode }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = finalTranscript + interimTranscript
        setTranscript(fullTranscript)
        onTranscript(fullTranscript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.')
        }
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error('Failed to restart recognition:', e)
            setIsRecording(false)
          }
        }
      }
    }
  }, [])

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (e) {
        console.error('Failed to start recognition:', e)
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    onTranscript('')
  }

  if (!isSupported) {
    return (
      <div className="p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Voice input is not supported in your browser.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Please use Chrome, Edge, or Safari for voice input.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value)
            onTranscript(e.target.value)
          }}
          placeholder="Click the microphone to start recording, or type your response..."
          className="w-full h-48 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {isRecording && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full"
          />
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-primary-600 hover:bg-primary-700'
          } shadow-lg hover:shadow-xl`}
        >
          {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
        </button>
        {transcript && (
          <button
            onClick={clearTranscript}
            className="py-3 px-6 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-all"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-primary-600 dark:text-primary-400"
        >
          🎤 Listening... Speak now
        </motion.div>
      )}
    </div>
  )
}

export default VoiceRecorder

