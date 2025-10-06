'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🛡️ 관리자 대시보드</h1>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overall Statistics */}
        {analytics?.overall && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">총 질문 수</div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.overall.total_interactions}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">성공률</div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.overall.success_rate}%
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">평균 응답 시간</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(analytics.overall.avg_response_time_ms)}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">평균 검색 결과</div>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.overall.avg_search_results}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">실패한 질문</div>
              <div className="text-2xl font-bold text-red-600">
                {analytics.overall.failed_responses}
              </div>
            </div>
          </div>
        )}

        {/* Performance Breakdown */}
        {analytics?.overall && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">⏱️ 성능 분석</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">임베딩 생성</div>
                <div className="text-lg font-bold text-blue-500">
                  {formatTime(analytics.overall.avg_embedding_time_ms)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">벡터 검색</div>
                <div className="text-lg font-bold text-green-500">
                  {formatTime(analytics.overall.avg_search_time_ms)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">LLM 응답</div>
                <div className="text-lg font-bold text-purple-500">
                  {formatTime(analytics.overall.avg_llm_time_ms)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">전체 시간</div>
                <div className="text-lg font-bold text-gray-700">
                  {formatTime(analytics.overall.avg_response_time_ms)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popular Questions */}
        {analytics?.topQuestions && analytics.topQuestions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">🔥 인기 질문 TOP 10</h2>
            <div className="space-y-3">
              {analytics.topQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">#{index + 1}</span>
                    <span className="ml-2 text-gray-900">{item.question}...</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{item.count}회</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">📝 최근 질문 로그</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    질문
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    응답 시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    검색 결과
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.user_question}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(log.response_time_ms)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.search_results_count || 0}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.error_occurred ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          실패
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
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
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  전체 {pagination.total}개 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchLogs(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <span className="px-3 py-1 text-sm">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchLogs(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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