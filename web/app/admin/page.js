'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './layout'

export default function AdminDashboard() {
  const { handleLogout } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchAnalytics()
    fetchLogs(1)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchLogs = async (page) => {
    try {
      const response = await fetch(`/api/admin/logs?page=${page}&limit=10`)
      const data = await response.json()
      setLogs(data.logs || [])
      setPagination(data.pagination)
      setCurrentPage(page)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching logs:', error)
      setLoading(false)
    }
  }

  const formatTime = (ms) => {
    if (!ms) return '0ms'
    return `${ms}ms`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">📊</div>
          <div className="mt-2 text-gray-600">관리자 대시보드 로딩 중...</div>
        </div>
      </div>
    )
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
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title - takes full width on mobile, shrinks on desktop */}
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>🛡️</span>
              <span className="truncate">관리자 대시보드</span>
            </h1>

            {/* Button group - stacks on mobile, inline on desktop */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20
                         text-white text-sm hover:bg-white/20 transition-all whitespace-nowrap"
              >
                메인으로 돌아가기
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg backdrop-blur-sm bg-red-500/20 border border-red-400/30
                         text-red-300 text-sm hover:bg-red-500/30 transition-all whitespace-nowrap"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Overall Statistics */}
        {analytics?.overall && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/70">총 질문 수</div>
              <div className="text-3xl font-bold text-blue-300 mt-2">
                {analytics.overall.total_interactions}
              </div>
            </div>

            <div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/70">성공률</div>
              <div className="text-3xl font-bold text-green-300 mt-2">
                {analytics.overall.success_rate}%
              </div>
            </div>

            <div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/70">평균 응답 시간</div>
              <div className="text-3xl font-bold text-purple-300 mt-2">
                {formatTime(analytics.overall.avg_response_time_ms)}
              </div>
            </div>

            <div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/70">평균 검색 결과</div>
              <div className="text-3xl font-bold text-orange-300 mt-2">
                {analytics.overall.avg_search_results}
              </div>
            </div>

            <div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/70">실패한 질문</div>
              <div className="text-3xl font-bold text-red-300 mt-2">
                {analytics.overall.failed_responses}
              </div>
            </div>
          </div>
        )}

        {/* Performance Breakdown */}
        {analytics?.overall && (
          <div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">⏱️ 성능 분석</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="text-sm text-white/70">임베딩 생성</div>
                <div className="text-lg font-bold text-blue-300 mt-1">
                  {formatTime(analytics.overall.avg_embedding_time_ms)}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="text-sm text-white/70">벡터 검색</div>
                <div className="text-lg font-bold text-green-300 mt-1">
                  {formatTime(analytics.overall.avg_search_time_ms)}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="text-sm text-white/70">LLM 응답</div>
                <div className="text-lg font-bold text-purple-300 mt-1">
                  {formatTime(analytics.overall.avg_llm_time_ms)}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="text-sm text-white/70">전체 시간</div>
                <div className="text-lg font-bold text-white mt-1">
                  {formatTime(analytics.overall.avg_response_time_ms)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popular Questions */}
        {analytics?.topQuestions && analytics.topQuestions.length > 0 && (
          <div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">🔥 인기 질문 TOP 10</h2>
            <div className="space-y-2">
              {analytics.topQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex-1">
                    <span className="text-sm text-white/60">#{index + 1}</span>
                    <span className="ml-2 text-white">{item.question}...</span>
                  </div>
                  <span className="text-sm font-medium text-blue-300">{item.count}회</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Logs */}
        <div className="rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">📝 최근 질문 로그</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    질문
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    AI 답변
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    응답 시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    검색 결과
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white max-w-xs truncate">
                      {log.user_question}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/80 max-w-sm truncate">
                      {log.ai_response ? log.ai_response.substring(0, 100) + '...' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {formatTime(log.response_time_ms)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {log.search_results_count || 0}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.error_occurred ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 border border-red-400/30 text-red-300">
                          실패
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 border border-green-400/30 text-green-300">
                          성공
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="px-6 py-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/70">
                  전체 {pagination.total}개 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchLogs(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 text-sm rounded-lg bg-white/5 border border-white/20 text-white
                             disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                  >
                    이전
                  </button>
                  <span className="px-4 py-2 text-sm text-white">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchLogs(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-4 py-2 text-sm rounded-lg bg-white/5 border border-white/20 text-white
                             disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}