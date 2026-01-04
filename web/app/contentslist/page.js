'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const CATEGORIES = [
  "❓질문게시판 Q&A",
  "🍽️스위스 맛집 후기",
  "🏨스위스 숙소 후기",
  "🌤️스위스 날씨",
  "🚂스위스패스/기차",
  "★인터라켄★",
  "★루체른★",
  "★체르마트★",
  "✍🏼끄적끄적 스위스여행기",
  "🔎기타 꿀팁",
  "✈️항공권 꿀팁",
  "🚑나의 여행 실수담",
  "🚗렌트카/자동차",
  "🛒coop, migros, 쇼핑",
  "🧳짐싸기 꿀팁",
  "여행 질문 Q&A",
  "★기타 전체 지역★",
  "📍스위스 여행루트",
  "🇨🇭스위스어디까지가봤니",
  "🇨🇭스위스여행 Top3",
  "쏙닥쏙닥 자유게시판",
  "✈️여행준비콘테스트",
  "⭐스프 인기작가 모아보기",
  "다음에는 어디로?",
  "스위스 기초 정보",
  "스위스 여행 컨설팅",
  "스위스 할인쿠폰",
  "스위스프렌즈 공지사항",
  "자주하는질문모음",
  "🇫🇷프랑스 France",
  "🇮🇹이탈리아 Italia",
  "🇬🇧영국 UK",
  "🇪🇸스페인 Spain",
  "🇦🇹오스트리아 Austria",
  "🇩🇪독일 Germany",
  "🇨🇿체코 Czech",
  "🇵🇱폴란드 Poland",
  "🇰🇷★대한민국★",
  "기타 국가",
  "📷스위스 여행사진",
  "📺스프 TV",
  "🤖스프AI질의응답",
  "가입인사",
  "🦠코로나 테스트",
  "🧑‍🤝‍🧑스위스 동행구함",
  "스프 공식 정모&번개",
  "스프 댓글왕 시상식",
  "읽고 댓글달면 정회원",
  "자기 소개 + 셀카",
  "한국자유여행연합회",
  "(구) 공지사항",
  "(구)질문전! 필수 작성글!"
]

export default function ContentsListPage() {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)
  const [orderBy, setOrderBy] = useState('date_desc') // date_desc, date_asc, view_count, comments

  // Filters
  const [selectedCategories, setSelectedCategories] = useState(CATEGORIES) // 초기값: 모두 선택
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')
  const [excludeColdSundae, setExcludeColdSundae] = useState(true) // 초기값: 차가운순대 제외
  const [showAllCategories, setShowAllCategories] = useState(false) // 카테고리 펼치기/접기

  // Modal state
  const [editingContent, setEditingContent] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchContents = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('swissfriends_content_all')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)

      // Category filter
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories)
      }

      // Exclude author filter
      if (excludeColdSundae) {
        query = query.neq('author', '차가운순대')
      }

      // Order by
      switch (orderBy) {
        case 'date_desc':
          query = query.order('date', { ascending: false })
          break
        case 'date_asc':
          query = query.order('date', { ascending: true })
          break
        case 'view_count':
          query = query.order('view_count', { ascending: false })
          break
        case 'comments':
          query = query.order('comments', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching contents:', error)
        alert('콘텐츠 조회 중 오류가 발생했습니다.')
        return
      }

      setContents(data || [])
    } catch (error) {
      console.error('Error:', error)
      alert('콘텐츠 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const selectAllCategories = () => {
    setSelectedCategories(CATEGORIES)
  }

  const deselectAllCategories = () => {
    setSelectedCategories([])
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatNumber = (num) => {
    if (!num) return 0
    return num.toLocaleString('ko-KR')
  }

  const getMonthLabel = (postMonth) => {
    if (postMonth === null) return '미확인'
    if (postMonth === 0) return '전체월'
    if (postMonth >= 1 && postMonth <= 12) return `${postMonth}월`
    return '-'
  }

  const openEditModal = (content) => {
    setEditingContent(content)
    setSelectedMonth(content.post_month !== null ? content.post_month : '')
  }

  const closeEditModal = () => {
    setEditingContent(null)
    setSelectedMonth(null)
  }

  const updatePostMonth = async () => {
    if (!editingContent) return

    setIsUpdating(true)
    try {
      const monthValue = selectedMonth === '' ? null : parseInt(selectedMonth)

      const { error } = await supabase
        .from('swissfriends_content_all')
        .update({ post_month: monthValue })
        .eq('id', editingContent.id)

      if (error) {
        console.error('Error updating post_month:', error)
        alert('업데이트 중 오류가 발생했습니다.')
        return
      }

      // Update local state
      setContents(prev => prev.map(content =>
        content.id === editingContent.id
          ? { ...content, post_month: monthValue }
          : content
      ))

      alert('여행 월 정보가 업데이트되었습니다.')
      closeEditModal()
    } catch (error) {
      console.error('Error:', error)
      alert('업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
              스위스프렌즈 콘텐츠 관리
            </h1>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all duration-200"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Panel */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">필터</h2>

          {/* Category Checkboxes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">카테고리</label>
              <div className="space-x-2">
                <button
                  onClick={selectAllCategories}
                  className="text-sm text-blue-300 hover:text-blue-200"
                >
                  전체선택
                </button>
                <button
                  onClick={deselectAllCategories}
                  className="text-sm text-blue-300 hover:text-blue-200"
                >
                  선택해제
                </button>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4)).map(category => {
                  const isChecked = selectedCategories.includes(category)
                  return (
                    <label
                      key={category}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm cursor-pointer
                        transition-all duration-200 border
                        ${isChecked
                          ? 'bg-blue-500/30 border-blue-400/50 text-white hover:bg-blue-500/40'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                        }
                      `}
                    >
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(category)}
                          className="sr-only"
                        />
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                          ${isChecked
                            ? 'bg-blue-500 border-blue-400'
                            : 'bg-white/10 border-white/30'
                          }
                        `}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="truncate flex-1">{category}</span>
                    </label>
                  )
                })}
              </div>
              {CATEGORIES.length > 4 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="mt-3 w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20
                           text-white text-sm font-medium transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  {showAllCategories ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      접기 ({CATEGORIES.length - 4}개 숨기기)
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      더보기 ({CATEGORIES.length - 4}개 더보기)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Order By */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">정렬 기준</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setOrderBy('date_desc')}
                className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                  orderBy === 'date_desc'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setOrderBy('date_asc')}
                className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                  orderBy === 'date_asc'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                오래된순
              </button>
              <button
                onClick={() => setOrderBy('view_count')}
                className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                  orderBy === 'view_count'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                조회수 많은순
              </button>
              <button
                onClick={() => setOrderBy('comments')}
                className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                  orderBy === 'comments'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                댓글 많은순
              </button>
            </div>
          </div>

          {/* Exclude Author */}
          <div className="mb-6">
            <label className={`
              inline-flex items-center space-x-3 px-4 py-3 rounded-lg text-sm cursor-pointer
              transition-all duration-200 border
              ${excludeColdSundae
                ? 'bg-blue-500/30 border-blue-400/50 text-white hover:bg-blue-500/40'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }
            `}>
              <div className="relative flex items-center justify-center flex-shrink-0">
                <input
                  type="checkbox"
                  checked={excludeColdSundae}
                  onChange={(e) => setExcludeColdSundae(e.target.checked)}
                  className="sr-only"
                />
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${excludeColdSundae
                    ? 'bg-blue-500 border-blue-400'
                    : 'bg-white/10 border-white/30'
                  }
                `}>
                  {excludeColdSundae && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-medium">"차가운순대" 제외</span>
            </label>
          </div>

          {/* Fetch Button */}
          <button
            onClick={fetchContents}
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold
                     hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '조회 중...' : '조회하기'}
          </button>
        </div>

        {/* Results Section */}
        {contents.length > 0 && (
          <>
            {/* Results Count */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">검색 결과</span>
                <span className="text-white/70">
                  총 {contents.length}개
                </span>
              </div>
            </div>

            {/* Contents Table */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10 border-b border-white/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-white font-semibold w-32">카테고리</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">제목</th>
                      <th className="px-4 py-3 text-left text-white font-semibold w-28">작성자</th>
                      <th className="px-4 py-3 text-left text-white font-semibold w-32">날짜</th>
                      <th className="px-4 py-3 text-center text-white font-semibold w-24">조회수</th>
                      <th className="px-4 py-3 text-center text-white font-semibold w-20">댓글</th>
                      <th className="px-4 py-3 text-center text-white font-semibold w-24">여행 월</th>
                      <th className="px-4 py-3 text-center text-white font-semibold w-24">수정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {contents.map((content) => (
                      <tr key={content.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white/70 text-sm">
                          <div className="truncate max-w-[8rem]" title={content.category}>
                            {content.category || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {content.url ? (
                            <a
                              href={content.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-300 hover:text-blue-200 hover:underline"
                            >
                              {content.title}
                            </a>
                          ) : (
                            <span className="text-white">{content.title}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm">
                          {content.author ? (
                            <a
                              href={`/contentslist/${encodeURIComponent(content.author)}`}
                              className="text-blue-300 hover:text-blue-200 hover:underline truncate block max-w-[7rem]"
                              title={content.author}
                            >
                              {content.author}
                            </a>
                          ) : (
                            <div className="truncate max-w-[7rem]">-</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm whitespace-nowrap">{formatDate(content.date)}</td>
                        <td className="px-4 py-3 text-center text-white/70 text-sm">{formatNumber(content.view_count)}</td>
                        <td className="px-4 py-3 text-center text-white/70 text-sm">{formatNumber(content.comments)}</td>
                        <td className="px-4 py-3 text-center text-white/70 text-sm">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            content.post_month === null
                              ? 'bg-gray-500/30 text-gray-300'
                              : content.post_month === 0
                              ? 'bg-green-500/30 text-green-300'
                              : 'bg-blue-500/30 text-blue-300'
                          }`}>
                            {getMonthLabel(content.post_month)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openEditModal(content)}
                            className="px-3 py-1 rounded-lg bg-purple-500/30 hover:bg-purple-500/50
                                     border border-purple-400/50 text-purple-200 text-xs font-medium
                                     transition-all duration-200"
                          >
                            수정
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && contents.length === 0 && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
            <p className="text-white/70 text-lg">
              조회 버튼을 눌러 콘텐츠를 불러오세요.
            </p>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">여행 월 수정</h3>

            <div className="mb-4">
              <p className="text-white/70 text-sm mb-2">제목: {editingContent.title}</p>
            </div>

            <div className="mb-6">
              <label className="block text-white font-medium mb-2">여행 월 선택</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">미확인 (null)</option>
                <option value="0">전체월 (0)</option>
                <option value="1">1월</option>
                <option value="2">2월</option>
                <option value="3">3월</option>
                <option value="4">4월</option>
                <option value="5">5월</option>
                <option value="6">6월</option>
                <option value="7">7월</option>
                <option value="8">8월</option>
                <option value="9">9월</option>
                <option value="10">10월</option>
                <option value="11">11월</option>
                <option value="12">12월</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={updatePostMonth}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600
                         text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={closeEditModal}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20
                         border border-white/20 text-white font-medium transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
