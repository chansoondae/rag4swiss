import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🇨🇭</span>
            <h1 className="text-2xl font-bold text-gray-900">
              스위스 여행 AI 도우미
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            스위스 여행, AI에게 물어보세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            10개의 상세 가이드 기반 즉시 답변
          </p>
          
          <Link 
            href="/chat"
            className="inline-block bg-swiss-red text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors"
          >
            지금 질문하기 →
          </Link>
        </div>

        {/* Sample Questions */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            이런 질문들을 해보세요
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {sampleQuestions.map((question, index) => (
              <Link
                key={index}
                href={`/chat?q=${encodeURIComponent(question)}`}
                className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500">💬</span>
                  <span className="text-gray-800">{question}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">즉시 답변</h4>
            <p className="text-gray-600">
              질문하는 즉시 AI가 관련 정보를 찾아 답변해드립니다
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">신뢰할 수 있는 정보</h4>
            <p className="text-gray-600">
              검증된 여행 가이드를 기반으로 정확한 정보를 제공합니다
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🇨🇭</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">스위스 전문</h4>
            <p className="text-gray-600">
              스위스 여행에 특화된 상세하고 실용적인 정보를 제공합니다
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            지금 바로 시작해보세요
          </h3>
          <p className="text-gray-600 mb-6">
            무료로 스위스 여행 정보를 얻어보세요
          </p>
          
          <Link 
            href="/chat"
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            스위스 여행 AI 도우미 - 더 나은 여행을 위한 AI 파트너
          </p>
        </div>
      </footer>
    </div>
  )
}