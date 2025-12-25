import React from 'react'
import { motion } from 'framer-motion'

function FeedbackCard({ feedback, darkMode }) {
  if (!feedback) return null

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400'
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getToneColor = (tone) => {
    switch (tone.toLowerCase()) {
      case 'confident':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'neutral':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'uncertain':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
    >
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Feedback
      </h3>

      {/* Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Overall Score
          </span>
          <span className={`text-4xl font-bold ${getScoreColor(feedback.score)}`}>
            {feedback.score}/10
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(feedback.score / 10) * 100}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${
              feedback.score >= 8
                ? 'bg-green-500'
                : feedback.score >= 6
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Summary
        </h4>
        <p className="text-gray-700 dark:text-gray-300">{feedback.summary}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tone</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getToneColor(feedback.tone)}`}>
            {feedback.tone}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Filler Words</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {feedback.filler_words_count}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clarity</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {feedback.clarity || 'moderate'}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {feedback.confidence || 'moderate'}
          </div>
        </div>
      </div>

      {/* Filler Words List */}
      {feedback.filler_words && feedback.filler_words.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Detected Filler Words
          </h4>
          <div className="flex flex-wrap gap-2">
            {feedback.filler_words.map((word, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Tips */}
      {feedback.improvement_tips && feedback.improvement_tips.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Improvement Tips
          </h4>
          <ul className="space-y-2">
            {feedback.improvement_tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20"
              >
                <span className="text-primary-600 dark:text-primary-400 font-bold mt-0.5">
                  {index + 1}.
                </span>
                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

export default FeedbackCard

