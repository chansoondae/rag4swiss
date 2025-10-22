'use client'

import { motion } from 'framer-motion'
import SourceCard from './SourceCard'
import { formatTimestamp } from '../lib/utils'

export default function MessageBubble({ message }) {
  const { role, content, timestamp, sources, isError } = message

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-xs lg:max-w-2xl">
        <div
          className={`p-4 rounded-2xl backdrop-blur-lg border shadow-lg
            ${role === 'assistant'
              ? isError
                ? 'bg-red-500/20 border-red-400/30 text-white'
                : 'bg-white/10 border-white/20 text-white'
              : 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 border-blue-400/30 text-white'
            }
          `}
        >
          {role === 'assistant' && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🤖</span>
              <span className="text-xs text-white/70 font-medium">AI 도우미</span>
            </div>
          )}

          <div className="whitespace-pre-wrap leading-relaxed">{content}</div>

          {/* Timestamp */}
          <div className="text-xs opacity-60 mt-2">
            {formatTimestamp(timestamp)}
          </div>
        </div>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 space-y-2"
          >
            {sources.map((source, index) => (
              <SourceCard key={index} source={source} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}