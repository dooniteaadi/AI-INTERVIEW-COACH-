import React from 'react'
import { motion } from 'framer-motion'

function FeedbackCard({ feedback, darkMode }) {
  if (!feedback) return null

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-500'
    if (score >= 6) return 'text-amber-500'
    return 'text-rose-500'
  }

  const getToneBadge = (tone) => {
    switch (tone.toLowerCase()) {
      case 'confident':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          label: 'Confident 🎯'
        }
      case 'uncertain':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
          label: 'Uncertain ❓'
        }
      case 'neutral':
      default:
        return {
          bg: 'bg-primary-500/10 dark:bg-primary-500/5 text-primary-600 dark:text-primary-400 border-primary-500/20',
          label: 'Neutral ⚖️'
        }
    }
  }

  const getMetricProgressBar = (level) => {
    const l = (level || '').toLowerCase()
    if (l === 'excellent' || l === 'high') return { w: '100%', color: 'bg-emerald-500' }
    if (l === 'good') return { w: '75%', color: 'bg-primary-500' }
    if (l === 'moderate' || l === 'medium') return { w: '50%', color: 'bg-amber-500' }
    return { w: '25%', color: 'bg-rose-500' }
  }

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (feedback.score / 10) * circumference
  const toneInfo = getToneBadge(feedback.tone || 'neutral')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/60 dark:border-slate-800/80"
    >
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-6 mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          Evaluation Report
        </h3>
        <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
          Instant Analysis
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-center mb-8">
        {/* Animated Circular Score Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-100/30 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/30 rounded-2xl">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
            Overall Score
          </span>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800/50"
                strokeWidth="7"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className={feedback.score >= 8 ? 'stroke-emerald-500' : feedback.score >= 6 ? 'stroke-amber-500' : 'stroke-rose-500'}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold ${getScoreColor(feedback.score)}`}>
                {feedback.score}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                Out of 10
              </span>
            </div>
          </div>
        </div>

        {/* Answer Summary Card */}
        <div className="md:col-span-2 flex flex-col justify-center h-full">
          <h4 className="text-lg font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>💡</span> Coach's Assessment
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
            {feedback.summary || "Your answer was parsed successfully. Look below for detailed metrics and actionable improvement steps to structure your next response."}
          </p>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <h4 className="text-sm uppercase font-extrabold tracking-wider text-slate-400 mb-4">
        Speech & Tone Metrics
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Tone */}
        <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40">
          <span className="block text-xs font-semibold text-slate-400 mb-2">Speech Tone</span>
          <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${toneInfo.bg}`}>
            {toneInfo.label}
          </span>
        </div>

        {/* Filler Words */}
        <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40">
          <span className="block text-xs font-semibold text-slate-400 mb-1.5">Filler Words</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${feedback.filler_words_count > 3 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
              {feedback.filler_words_count}
            </span>
            <span className="text-xs text-slate-400">found</span>
          </div>
        </div>

        {/* Clarity */}
        <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40">
          <span className="block text-xs font-semibold text-slate-400 mb-1.5">Clarity</span>
          <span className="block text-sm font-bold text-slate-900 dark:text-white capitalize mb-2">
            {feedback.clarity || 'moderate'}
          </span>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${getMetricProgressBar(feedback.clarity).color}`}
              style={{ width: getMetricProgressBar(feedback.clarity).w }}
            />
          </div>
        </div>

        {/* Confidence */}
        <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40">
          <span className="block text-xs font-semibold text-slate-400 mb-1.5">Confidence</span>
          <span className="block text-sm font-bold text-slate-900 dark:text-white capitalize mb-2">
            {feedback.confidence || 'moderate'}
          </span>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${getMetricProgressBar(feedback.confidence).color}`}
              style={{ width: getMetricProgressBar(feedback.confidence).w }}
            />
          </div>
        </div>
      </div>

      {/* STAR Technique Advisor */}
      <h4 className="text-sm uppercase font-extrabold tracking-wider text-slate-400 mb-4">
        STAR Technique Alignment
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { key: 'situation', label: 'Situation (S)', desc: 'Background & context' },
          { key: 'task', label: 'Task (T)', desc: 'Challenges & targets' },
          { key: 'action', label: 'Action (A)', desc: 'Tactics, work, & skills' },
          { key: 'result', label: 'Result (R)', desc: 'Measurable achievements' }
        ].map((star) => {
          const rating = feedback.star_rating?.[star.key] || 'missing';
          const getStarColor = (status) => {
            const s = (status || '').toLowerCase()
            if (s === 'excellent') return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            if (s === 'good') return 'border-primary-500/35 bg-primary-500/10 text-primary-600 dark:text-primary-400'
            return 'border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/10 text-slate-400'
          }
          return (
            <div key={star.key} className={`p-4 rounded-2xl border ${getStarColor(rating)} flex flex-col justify-between`}>
              <div>
                <span className="block text-sm font-bold">{star.label}</span>
                <span className="block text-[10px] opacity-70 mt-0.5 leading-snug">{star.desc}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-4">
                <span className="text-xs uppercase font-extrabold tracking-wide">
                  {rating === 'excellent' ? '✨ Excellent' : rating === 'good' ? '✓ Present' : '✗ Missing'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {feedback.star_feedback && (
        <div className="mb-8 p-5 bg-primary-500/5 dark:bg-primary-950/10 border border-primary-500/10 dark:border-primary-800/20 rounded-2xl">
          <h4 className="text-sm font-bold mb-2 text-primary-700 dark:text-primary-400 flex items-center gap-1.5">
            <span>💡</span> STAR Structure Feedback
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-light">
            {feedback.star_feedback}
          </p>
        </div>
      )}

      {/* Filler Words List */}
      {feedback.filler_words && feedback.filler_words.length > 0 && (
        <div className="mb-8 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
          <h4 className="text-sm font-bold mb-3 text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <span>⚠️</span> Detected Verbal Crutches
          </h4>
          <div className="flex flex-wrap gap-2">
            {feedback.filler_words.map((word, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold"
              >
                "{word}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Tips */}
      {feedback.improvement_tips && feedback.improvement_tips.length > 0 && (
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-6">
          <h4 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
            <span>📈</span> Key Improvement Areas
          </h4>
          <div className="grid gap-3">
            {feedback.improvement_tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-950/40 border border-primary-200/30 dark:border-primary-850/20 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-light">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default FeedbackCard


