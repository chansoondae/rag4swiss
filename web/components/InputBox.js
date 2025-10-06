'use client'

import { useState, useRef } from 'react'
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
    <form onSubmit={handleSubmit} className="flex space-x-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{ maxHeight: '120px' }}
        />
        
        {/* Character count */}
        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
          {message.length}/1000
        </div>
      </div>
      
      <button
        type="submit"
        disabled={disabled || !validateMessage(message)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {disabled ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>전송중</span>
          </div>
        ) : (
          '전송'
        )}
      </button>
    </form>
  )
}