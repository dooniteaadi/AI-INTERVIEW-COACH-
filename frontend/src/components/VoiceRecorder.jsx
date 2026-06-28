import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function VoiceRecorder({ onTranscript, onVolumeData, darkMode }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const volumeIntervalRef = useRef(null)
  const volumeDataRef = useRef([])

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

    return () => {
      // Cleanup audio context on unmount
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  const startRecording = async () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
        
        // Initialize Web Audio API for extracting volume dynamics
        volumeDataRef.current = []
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        streamRef.current = stream

        const AudioContext = window.AudioContext || window.webkitAudioContext
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        volumeIntervalRef.current = setInterval(() => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i]
            }
            const average = sum / bufferLength
            
            // Normalize value to a 0-100 range
            const normalized = Math.min(Math.round((average / 128) * 100), 100)
            volumeDataRef.current.push(normalized)
            
            if (onVolumeData) {
              onVolumeData([...volumeDataRef.current])
            }
          }
        }, 150) // Sample decibel peaks every 150ms

      } catch (e) {
        console.error('Failed to start microphone or Web Audio Context:', e)
        // Fallback to recording without audio visualization if blocked
        try {
          recognitionRef.current.start()
          setIsRecording(true)
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)

      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current)
        volumeIntervalRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    onTranscript('')
    volumeDataRef.current = []
    if (onVolumeData) {
      onVolumeData([])
    }
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
          placeholder="Click the microphone to start recording, or type to edit your response..."
          className="w-full h-48 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-300"
        />
        {isRecording && (
          <div className="absolute top-5 right-5 flex items-end gap-1 h-6">
            <span className="w-1 bg-red-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.1s', height: '100%' }}></span>
            <span className="w-1 bg-red-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.3s', height: '60%' }}></span>
            <span className="w-1 bg-red-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.5s', height: '80%' }}></span>
            <span className="w-1 bg-red-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.2s', height: '50%' }}></span>
            <span className="w-1 bg-red-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.4s', height: '90%' }}></span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            isRecording
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/10 active:scale-[0.99]'
              : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-primary-500/10 active:scale-[0.99]'
          }`}
        >
          {isRecording ? (
            <>
              <span>⏹️ Stop Recording</span>
            </>
          ) : (
            <>
              <span>🎤 Start Recording</span>
            </>
          )}
        </button>
        {transcript && (
          <button
            onClick={clearTranscript}
            className="py-4 px-6 rounded-2xl font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all duration-300 active:scale-[0.99] cursor-pointer"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs font-bold text-red-500 dark:text-red-400 animate-pulse"
        >
          🎙️ Listening... Speak clearly into your microphone
        </motion.div>
      )}
    </div>
  )
}

export default VoiceRecorder
