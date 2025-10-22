'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { validateMessage } from '../lib/utils'

export default function InputBox({ onSendMessage, disabled, placeholder = "메시지를 입력하세요..." }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateMessage(message) || disabled) {
      return
    }

    const trimmedMessage = message.trim()
    onSendMessage(trimmedMessage)
    setMessage('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInput = (e) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full px-5 py-4 rounded-2xl resize-none
                   backdrop-blur-lg bg-white/10 border border-white/20
                   text-white placeholder-white/50
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                   disabled:bg-white/5 disabled:cursor-not-allowed
                   transition-all"
          style={{ maxHeight: '120px' }}
        />

        {/* Character count */}
        <div className="absolute bottom-2 right-3 text-xs text-white/40">
          {message.length}/1000
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={disabled || !validateMessage(message)}
        whileHover={{ scale: disabled || !validateMessage(message) ? 1 : 1.05 }}
        whileTap={{ scale: disabled || !validateMessage(message) ? 1 : 0.95 }}
        className="px-8 py-4 rounded-2xl font-semibold
                 bg-gradient-to-r from-blue-500 to-purple-600
                 text-white shadow-lg shadow-purple-500/30
                 hover:shadow-xl hover:shadow-purple-500/50
                 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none
                 disabled:cursor-not-allowed disabled:opacity-50
                 transition-all duration-300"
      >
        {disabled ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>전송중</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>전송</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        )}
      </motion.button>
    </form>
  )
}