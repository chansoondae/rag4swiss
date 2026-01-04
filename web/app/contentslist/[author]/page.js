'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function AuthorListPage() {
  const params = useParams()
  const author = decodeURIComponent(params.author)

  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [excludeQA, setExcludeQA] = useState(true) // 질문게시판 제외 초기값
  const [showDetails, setShowDetails] = useState(false) // 상세 정보 표시 여부
  const [postDetails, setPostDetails] = useState({}) // 각 포스트의 상세 정보 (댓글)
  const [loadingDetails, setLoadingDetails] = useState(false) // 상세 정보 로딩 중
  const [lastExcludeQA, setLastExcludeQA] = useState(true) // 마지막으로 불러온 데이터의 excludeQA 상태

  // Modal state
  const [editingContent, setEditingContent] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchAuthorContents()
  }, [author])

  const fetchAuthorContents = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('swissfriends_content_all')
        .select('*')
        .eq('author', author)
        .order('date', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching author contents:', error)
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

  // 클라이언트 사이드 필터링
  const filteredContents = excludeQA
    ? contents.filter(content =>
        content.category !== '❓질문게시판 Q&A' &&
        content.category !== '여행 질문 Q&A'
      )
    : contents

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
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

  const copyAllContent = async () => {
    try {
      let copyText = `${author}님의 게시글\n\n`

      filteredContents.forEach((content, index) => {
        copyText += `글 ${index + 1}\n\n`
        copyText += `제목: ${content.title}\n`
        copyText += `카테고리: ${content.category || '기타'}\n`
        copyText += `작성자: ${author}\n`
        copyText += `날짜: ${formatDate(content.date)}\n`
        copyText += `조회수: ${formatNumber(content.view_count)}회 | 댓글수: ${formatNumber(content.comments)}개\n`
        copyText += `여행 월: ${getMonthLabel(content.post_month)}\n`

        if (content.url) {
          copyText += `URL: ${content.url}\n`
        }

        // 본문과 댓글 추가 (펼쳐져 있을 때만)
        if (showDetails && postDetails[content.id]) {
          if (postDetails[content.id].content) {
            copyText += `\n본문:\n${postDetails[content.id].content}\n`
          }

          if (postDetails[content.id].comments && postDetails[content.id].comments.length > 0) {
            copyText += `\n댓글 (${postDetails[content.id].comments.length}개):\n`
            postDetails[content.id].comments.forEach((comment, commentIndex) => {
              copyText += `\n${commentIndex + 1}. ${comment.comment_author} (${comment.comment_date})\n`
              copyText += `${comment.comment_text}\n`
            })
          }
        }

        copyText += `\n${'='.repeat(80)}\n\n`
      })

      await navigator.clipboard.writeText(copyText)
      alert('복사되었습니다!')
    } catch (error) {
      console.error('Copy failed:', error)
      alert('복사에 실패했습니다.')
    }
  }

  const toggleAllDetails = async () => {
    // 이미 표시 중이면 접기
    if (showDetails) {
      setShowDetails(false)
      return
    }

    // excludeQA 상태가 변경되었으면 데이터를 다시 불러와야 함
    const needReload = lastExcludeQA !== excludeQA && Object.keys(postDetails).length > 0

    // 이미 데이터가 있고 excludeQA 상태가 같으면 그냥 펼치기
    if (Object.keys(postDetails).length > 0 && !needReload) {
      setShowDetails(true)
      return
    }

    // 전체 본문과 댓글 불러오기 (질문게시판 제외 여부 확인)
    setLoadingDetails(true)
    try {
      // 현재 표시 중인 모든 게시글의 ID 수집 (질문게시판 제외 적용)
      const currentContents = excludeQA
        ? contents.filter(content =>
            content.category !== '❓질문게시판 Q&A' &&
            content.category !== '여행 질문 Q&A'
          )
        : contents

      const postIds = currentContents.map(content => content.id)

      // 본문 불러오기
      const { data: postContents, error: contentsError } = await supabase
        .from('swissfriends_post_contents')
        .select('*')
        .in('id', postIds)

      if (contentsError) {
        console.error('Error fetching post contents:', contentsError)
        alert('본문 조회 중 오류가 발생했습니다.')
        return
      }

      // 댓글 불러오기
      const { data: comments, error: commentsError } = await supabase
        .from('swissfriends_post_comments')
        .select('*')
        .in('post_id', postIds)
        .order('comment_order', { ascending: true })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
        alert('댓글 조회 중 오류가 발생했습니다.')
        return
      }

      // 게시글별로 본문과 댓글 그룹화
      const groupedData = {}

      // 본문 추가
      postContents.forEach(postContent => {
        groupedData[postContent.id] = {
          content: postContent.content,
          comments: []
        }
      })

      // 댓글 추가
      comments.forEach(comment => {
        if (!groupedData[comment.post_id]) {
          groupedData[comment.post_id] = {
            content: null,
            comments: []
          }
        }
        groupedData[comment.post_id].comments.push(comment)
      })

      setPostDetails(groupedData)
      setLastExcludeQA(excludeQA) // 현재 excludeQA 상태 저장
      setShowDetails(true)
    } catch (error) {
      console.error('Error:', error)
      alert('데이터 조회 중 오류가 발생했습니다.')
    } finally {
      setLoadingDetails(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/contentslist"
              className="text-blue-300 hover:text-blue-200 text-sm"
            >
              ← 전체 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className={`
              inline-flex items-center space-x-3 px-4 py-3 rounded-lg text-sm cursor-pointer
              transition-all duration-200 border
              ${excludeQA
                ? 'bg-blue-500/30 border-blue-400/50 text-white hover:bg-blue-500/40'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }
            `}>
              <div className="relative flex items-center justify-center flex-shrink-0">
                <input
                  type="checkbox"
                  checked={excludeQA}
                  onChange={(e) => setExcludeQA(e.target.checked)}
                  className="sr-only"
                />
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${excludeQA
                    ? 'bg-blue-500 border-blue-400'
                    : 'bg-white/10 border-white/30'
                  }
                `}>
                  {excludeQA && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-medium">질문게시판 제외</span>
            </label>

            <button
              onClick={toggleAllDetails}
              disabled={loadingDetails}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-all
                       bg-gradient-to-r from-blue-500 to-purple-600 text-white
                       hover:shadow-lg hover:shadow-purple-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingDetails ? '로딩 중...' : showDetails ? '접기' : '불러오기'}
            </button>

            <button
              onClick={copyAllContent}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-all
                       bg-gradient-to-r from-green-500 to-emerald-600 text-white
                       hover:shadow-lg hover:shadow-green-500/50
                       flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              복사하기
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
            <p className="text-white/70 text-lg">로딩 중...</p>
          </div>
        )}

        {/* Results */}
        {!loading && filteredContents.length > 0 && (
          <>
            {/* Results Count */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">검색 결과</span>
                <span className="text-white/70">
                  총 {filteredContents.length}개 {excludeQA && `(전체 ${contents.length}개)`}
                </span>
              </div>
            </div>

            {/* Author Name */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white">
                {author}님의 게시글
              </h1>
            </div>

            {/* Contents Cards */}
            <div className="grid gap-4">
              {filteredContents.map((content) => (
                <div
                  key={content.id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6
                           hover:bg-white/15 transition-all duration-200 hover:shadow-xl"
                >
                  {/* Title */}
                  <div className="mb-4">
                    <div className="text-white/60 text-xs font-medium mb-2">제목</div>
                    <h3 className="text-xl font-semibold">
                      {content.url ? (
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-blue-200 transition-colors"
                        >
                          {content.title}
                        </a>
                      ) : (
                        <span className="text-white">{content.title}</span>
                      )}
                    </h3>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    <div className="text-white/80">
                      <span className="mr-2">📁</span>
                      <span className="text-white/60">카테고리: </span>
                      <span>{content.category || '기타'}</span>
                    </div>
                    <div className="text-white/80">
                      <span className="mr-2">📅</span>
                      <span className="text-white/60">날짜: </span>
                      <span>{formatDate(content.date)}</span>
                    </div>
                    <div className="text-white/80">
                      <span className="mr-2">👁️</span>
                      <span className="text-white/60">조회수: </span>
                      <span>{formatNumber(content.view_count)}회</span>
                    </div>
                    <div className="text-white/80">
                      <span className="mr-2">💬</span>
                      <span className="text-white/60">댓글수: </span>
                      <span>{formatNumber(content.comments)}개</span>
                    </div>
                    <div className="text-white/80 flex items-center gap-2">
                      <span className="mr-2">🗓️</span>
                      <span className="text-white/60">여행 월: </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        content.post_month === null
                          ? 'bg-gray-500/30 text-gray-300'
                          : content.post_month === 0
                          ? 'bg-green-500/30 text-green-300'
                          : 'bg-blue-500/30 text-blue-300'
                      }`}>
                        {getMonthLabel(content.post_month)}
                      </span>
                      <button
                        onClick={() => openEditModal(content)}
                        className="ml-2 px-3 py-1 rounded-lg bg-purple-500/30 hover:bg-purple-500/50
                                 border border-purple-400/50 text-purple-200 text-xs font-medium
                                 transition-all duration-200"
                      >
                        수정
                      </button>
                    </div>
                  </div>

                  {/* Content and Comments Section */}
                  {showDetails && postDetails[content.id] && (
                    <div className="mt-6 pt-6 border-t border-white/20 space-y-6">
                      {/* Post Content */}
                      {postDetails[content.id].content && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <span>📄</span>
                            <span>본문</span>
                          </h4>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
                              {postDetails[content.id].content}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Comments */}
                      {postDetails[content.id].comments && postDetails[content.id].comments.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <span>💬</span>
                            <span>댓글 ({postDetails[content.id].comments.length}개)</span>
                          </h4>
                          <div className="space-y-3">
                            {postDetails[content.id].comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-white/5 rounded-lg p-4 border border-white/10"
                              >
                                <div className="flex items-center gap-2 mb-2 text-sm">
                                  <span className="text-blue-300 font-medium">{comment.comment_author}</span>
                                  <span className="text-white/40">•</span>
                                  <span className="text-white/60">{comment.comment_date}</span>
                                </div>
                                <p className="text-white/90 text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && filteredContents.length === 0 && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
            <p className="text-white/70 text-lg">
              {excludeQA && contents.length > 0
                ? '질문게시판을 제외하면 게시글이 없습니다.'
                : '게시글이 없습니다.'}
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
