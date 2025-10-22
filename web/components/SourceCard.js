'use client'

import { motion } from 'framer-motion'
import { formatSimilarityScore, extractFileNameFromPath } from '../lib/utils'

export default function SourceCard({ source }) {
  const { title, file_name, section_title, similarity } = source

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 5 }}
      className="p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10
               hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📄</span>
            <span className="font-medium text-white text-sm truncate">
              {title || extractFileNameFromPath(file_name)}
            </span>
          </div>

          {section_title && (
            <div className="mt-1 text-white/60 text-xs">
              섹션: {section_title}
            </div>
          )}

          <div className="mt-1 text-white/40 text-xs">
            출처: {extractFileNameFromPath(file_name)}
          </div>
        </div>

        {similarity && (
          <div className="ml-2 flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 rounded-lg
                         bg-green-500/20 border border-green-400/30
                         text-green-300 text-xs font-medium">
              {formatSimilarityScore(similarity)} 일치
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}