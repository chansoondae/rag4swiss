'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇨🇭</span>
              <h1 className="text-xl font-semibold text-gray-900">
                스위스 여행 AI 도우미
              </h1>
            </div>
            
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              홈으로
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <MessageList messages={messages} />
          {isLoading && (
            <div className="chat-message assistant">
              <div className="message-bubble assistant">
                <LoadingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
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