'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  const sampleQuestions = [
    "리기산 가는 방법?",
    "융프라우요흐 티켓 가격은?",
    "루체른에서 하루 일정 추천해줘",
    "스위스 교통카드 추천",
    "취리히 공항에서 시내 가는 법",
    "인터라켄 숙박 추천"
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <span className="text-4xl animate-float">🇨🇭</span>
              <h1 className="text-2xl font-bold text-white">
                스위스 여행 AI 도우미
              </h1>
            </div>
            <Link
              href="/contents"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all duration-200"
            >
              Contents
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            스위스 여행,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI에게 물어보세요
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
            10개의 상세 가이드 기반 즉시 답변
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold
                       bg-gradient-to-r from-blue-500 to-purple-600 text-white
                       shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70
                       transition-all duration-300"
            >
              지금 질문하기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        {/* Sample Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-semibold text-white mb-8 text-center">
            이런 질문들을 해보세요
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {sampleQuestions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Link
                  href={`/chat?q=${encodeURIComponent(question)}`}
                  className="block p-5 rounded-2xl backdrop-blur-lg bg-white/10
                           border border-white/20 hover:bg-white/20
                           shadow-lg hover:shadow-xl
                           transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                    <span className="text-white font-medium">{question}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: "⚡", title: "즉시 답변", desc: "질문하는 즉시 AI가 관련 정보를 찾아 답변해드립니다" },
            { icon: "📚", title: "신뢰할 수 있는 정보", desc: "검증된 여행 가이드를 기반으로 정확한 정보를 제공합니다" },
            { icon: "🇨🇭", title: "스위스 전문", desc: "스위스 여행에 특화된 상세하고 실용적인 정보를 제공합니다" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              className="p-8 rounded-2xl backdrop-blur-lg bg-white/10
                       border border-white/20
                       shadow-lg"
            >
              <div className="text-5xl mb-4 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
              <p className="text-white/70">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center p-10 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-white/20 to-white/10
                   border border-white/30 shadow-2xl"
        >
          <h3 className="text-3xl font-semibold text-white mb-4">
            지금 바로 시작해보세요
          </h3>
          <p className="text-white/80 mb-8 text-lg">
            무료로 스위스 여행 정보를 얻어보세요
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-semibold
                       bg-white text-purple-900
                       shadow-lg hover:shadow-2xl
                       transition-all duration-300"
            >
              무료로 시작하기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-md bg-black/20 border-t border-white/10 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white/60">
            스위스 여행 AI 도우미 - 더 나은 여행을 위한 AI 파트너
          </p>
        </div>
      </footer>
    </div>
  )
}