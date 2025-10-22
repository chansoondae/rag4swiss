'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import ChatInterface from '../../components/ChatInterface'
import MessageList from '../../components/MessageList'
import InputBox from '../../components/InputBox'
import LoadingIndicator from '../../components/LoadingIndicator'

function ChatPageContent() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const searchParams = useSearchParams()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle pre-filled question from URL
  useEffect(() => {
    const question = searchParams.get('q')
    if (question && messages.length === 0) {
      handleSendMessage(question)
    }
  }, [searchParams])

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '안녕하세요! 스위스 여행에 관해 궁금한 점을 물어보세요. 교통, 숙박, 관광지, 음식 등 어떤 것이든 도움드릴게요! 🇨🇭',
        timestamp: new Date().toISOString(),
        sources: []
      }])
    }
  }, [])

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        sources: data.sources || []
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setError('죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toISOString(),
        sources: [],
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <span className="text-3xl animate-float">🇨🇭</span>
              <h1 className="text-xl font-semibold text-white">
                스위스 여행 AI 도우미
              </h1>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20
                       text-white hover:bg-white/20 transition-all"
            >
              홈으로
            </motion.button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="relative z-10 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col px-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          <MessageList messages={messages} />
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-xs lg:max-w-md p-4 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20">
                <LoadingIndicator />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="pb-6 pt-4">
          <InputBox
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder="스위스 여행에 대해 물어보세요..."
          />
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🇨🇭</div>
          <div className="mt-2 text-gray-600">채팅 페이지를 로딩 중...</div>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}