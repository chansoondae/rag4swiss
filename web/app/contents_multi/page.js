'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const STORAGE_KEY = 'contents_multi_ids'

export default function ContentsMultiPage() {
  const [idInput, setIdInput] = useState('')
  const [idList, setIdList] = useState([])
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [postDetails, setPostDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(false)

  // localStorage에서 ID 리스트 불러오기
  useEffect(() => {
    const savedIds = localStorage.getItem(STORAGE_KEY)
    if (savedIds) {
      try {
        const parsed = JSON.parse(savedIds)
        if (Array.isArray(parsed)) {
          setIdList(parsed)
        }
      } catch (error) {
        console.error('Error loading saved IDs:', error)
      }
    }
  }, [])

  // ID 리스트가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (idList.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(idList))
    }
  }, [idList])

  const extractIdFromInput = (input) => {
    // URL에서 ID 추출: https://cafe.naver.com/swissfriends/67838 또는 https://cafe.naver.com/swissfriends/67838?art=xxx
    const urlMatch = input.match(/swissfriends\/(\d{5})/)
    if (urlMatch) {
      return urlMatch[1]
    }

    // 숫자만 있는 경우
    const numberMatch = input.match(/^\d+$/)
    if (numberMatch) {
      return input
    }

    return null
  }

  const handleAddIds = () => {
    const lines = idInput.split(/[\n,]/).map(line => line.trim()).filter(line => line)
    const newIds = []
    const duplicateIds = []

    lines.forEach(line => {
      const extractedId = extractIdFromInput(line)
      if (extractedId) {
        const id = parseInt(extractedId)
        if (!isNaN(id)) {
          if (idList.includes(id)) {
            duplicateIds.push(id)
          } else {
            newIds.push(id)
          }
        }
      }
    })

    if (newIds.length === 0 && duplicateIds.length === 0) {
      alert('유효한 ID 또는 URL을 입력해주세요.')
      return
    }

    if (newIds.length === 0 && duplicateIds.length > 0) {
      alert(`입력한 ID가 모두 중복입니다. (중복 ${duplicateIds.length}개)`)
      return
    }

    setIdList(prev => [...prev, ...newIds])
    setIdInput('')

    let message = `${newIds.length}개의 ID가 추가되었습니다.`
    if (duplicateIds.length > 0) {
      message += `\n중복된 ID ${duplicateIds.length}개는 제외되었습니다.`
    }
    alert(message)
  }

  const handleRemoveId = (idToRemove) => {
    setIdList(prev => prev.filter(id => id !== idToRemove))
  }

  const handleClearAll = () => {
    if (confirm('모든 ID를 삭제하시겠습니까?')) {
      setIdList([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const handleSaveCSV = () => {
    if (idList.length === 0) {
      alert('저장할 ID가 없습니다.')
      return
    }

    // CSV 형태로 저장 (한 줄에 하나씩)
    const csvContent = idList.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `contents_ids_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLoadCSV = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') return

      // CSV 파일에서 ID 추출
      const lines = text.split(/[\n,]/).map(line => line.trim()).filter(line => line)
      const newIds = []
      const duplicateIds = []

      lines.forEach(line => {
        const extractedId = extractIdFromInput(line)
        if (extractedId) {
          const id = parseInt(extractedId)
          if (!isNaN(id)) {
            if (idList.includes(id)) {
              duplicateIds.push(id)
            } else {
              newIds.push(id)
            }
          }
        }
      })

      if (newIds.length === 0 && duplicateIds.length === 0) {
        alert('CSV 파일에서 유효한 ID를 찾을 수 없습니다.')
        return
      }

      if (newIds.length === 0 && duplicateIds.length > 0) {
        alert(`CSV 파일의 ID가 모두 중복입니다. (중복 ${duplicateIds.length}개)`)
        return
      }

      setIdList(prev => [...prev, ...newIds])

      let message = `${newIds.length}개의 ID가 추가되었습니다.`
      if (duplicateIds.length > 0) {
        message += `\n중복된 ID ${duplicateIds.length}개는 제외되었습니다.`
      }
      alert(message)
    }

    reader.onerror = () => {
      alert('파일 읽기 중 오류가 발생했습니다.')
    }

    reader.readAsText(file)
    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    event.target.value = ''
  }

  const fetchContentsByIds = async () => {
    if (idList.length === 0) {
      alert('입력하기 버튼을 눌러 ID를 먼저 추가해주세요.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('swissfriends_content_all')
        .select('*')
        .in('id', idList)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching contents:', error)
        alert('콘텐츠 조회 중 오류가 발생했습니다.')
        return
      }

      setContents(data || [])

      // 결과가 없으면 알림
      if (!data || data.length === 0) {
        alert('조회된 결과가 없습니다.')
      } else if (data.length < idList.length) {
        alert(`${idList.length}개 중 ${data.length}개의 콘텐츠를 찾았습니다.`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('콘텐츠 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

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

  const generateContentText = () => {
    let text = `선택된 게시글 (${contents.length}개)\n\n`

    contents.forEach((content, index) => {
      text += `글 ${index + 1}\n\n`
      text += `제목: ${content.title}\n`
      text += `카테고리: ${content.category || '기타'}\n`
      text += `작성자: ${content.author}\n`
      text += `날짜: ${formatDate(content.date)}\n`
      text += `조회수: ${formatNumber(content.view_count)}회 | 댓글수: ${formatNumber(content.comments)}개\n`
      text += `여행 월: ${getMonthLabel(content.post_month)}\n`

      if (content.url) {
        text += `URL: ${content.url}\n`
      }

      // 본문과 댓글 추가 (펼쳐져 있을 때만)
      if (showDetails && postDetails[content.id]) {
        if (postDetails[content.id].content) {
          text += `\n본문:\n${postDetails[content.id].content}\n`
        }

        if (postDetails[content.id].comments && postDetails[content.id].comments.length > 0) {
          text += `\n댓글 (${postDetails[content.id].comments.length}개):\n`
          postDetails[content.id].comments.forEach((comment, commentIndex) => {
            text += `\n${commentIndex + 1}. ${comment.comment_author} (${comment.comment_date})\n`
            text += `${comment.comment_text}\n`
          })
        }
      }

      text += `\n${'='.repeat(10)}\n\n`
    })

    return text
  }

  const generateMarkdownContent = () => {
    let markdown = `# 선택된 게시글 (${contents.length}개)\n\n`

    contents.forEach((content, index) => {
      markdown += `## 글 ${index + 1}: ${content.title}\n\n`

      markdown += `### 기본 정보\n\n`
      markdown += `- **ID**: ${content.id}\n`
      markdown += `- **카테고리**: ${content.category || '기타'}\n`
      markdown += `- **작성자**: ${content.author}\n`
      markdown += `- **날짜**: ${formatDate(content.date)}\n`
      markdown += `- **조회수**: ${formatNumber(content.view_count)}회\n`
      markdown += `- **댓글수**: ${formatNumber(content.comments)}개\n`
      markdown += `- **여행 월**: ${getMonthLabel(content.post_month)}\n`

      if (content.url) {
        markdown += `- **URL**: [바로가기](${content.url})\n`
      }

      markdown += `\n`

      // 본문과 댓글 추가 (펼쳐져 있을 때만)
      if (showDetails && postDetails[content.id]) {
        if (postDetails[content.id].content) {
          markdown += `### 본문\n\n`
          markdown += `${postDetails[content.id].content}\n\n`
        }

        if (postDetails[content.id].comments && postDetails[content.id].comments.length > 0) {
          markdown += `### 댓글 (${postDetails[content.id].comments.length}개)\n\n`
          postDetails[content.id].comments.forEach((comment, commentIndex) => {
            markdown += `#### ${commentIndex + 1}. ${comment.comment_author} (${comment.comment_date})\n\n`
            markdown += `${comment.comment_text}\n\n`
          })
        }
      }

      markdown += `---\n\n`
    })

    return markdown
  }

  const copyAllContent = async () => {
    try {
      const text = generateContentText()
      await navigator.clipboard.writeText(text)
      alert('복사되었습니다!')
    } catch (error) {
      console.error('Copy failed:', error)
      alert('복사에 실패했습니다.')
    }
  }

  const downloadMarkdown = () => {
    if (contents.length === 0) {
      alert('다운로드할 콘텐츠가 없습니다.')
      return
    }

    const markdown = generateMarkdownContent()
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `contents_${new Date().toISOString().split('T')[0]}.md`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleAllDetails = async () => {
    // 이미 표시 중이면 접기
    if (showDetails) {
      setShowDetails(false)
      return
    }

    // 이미 데이터가 있으면 그냥 펼치기
    if (Object.keys(postDetails).length > 0) {
      setShowDetails(true)
      return
    }

    // 전체 본문과 댓글 불러오기
    setLoadingDetails(true)
    try {
      const postIds = contents.map(content => content.id)

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
            <h1 className="text-3xl font-bold text-white">
              ID로 콘텐츠 조회
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
        {/* Input Panel */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">ID 또는 URL 입력</h2>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">
              콘텐츠 ID 또는 URL (쉼표 또는 줄바꿈으로 구분)
            </label>
            <textarea
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="예시:&#10;67838&#10;https://cafe.naver.com/swissfriends/67838&#10;https://cafe.naver.com/swissfriends/67838?art=xxx"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white
                       placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500
                       min-h-[120px] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleAddIds}
              className="py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold
                       hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
            >
              입력하기
            </button>
            <button
              onClick={handleSaveCSV}
              className="py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold
                       hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                       flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              저장하기
            </button>
            <label className="py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold
                            hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300
                            flex items-center justify-center gap-2 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              불러오기
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleLoadCSV}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* ID List Panel */}
        {idList.length > 0 && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                입력된 ID 목록 ({idList.length}개)
              </h2>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/50
                         border border-red-400/50 text-red-200 text-sm font-medium
                         transition-all duration-200"
              >
                전체 삭제
              </button>
            </div>

            <button
              onClick={fetchContentsByIds}
              disabled={loading}
              className="w-full mb-4 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold
                       hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '조회 중...' : '조회하기'}
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {idList.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                           bg-blue-500/20 border border-blue-400/30 text-white text-sm"
                >
                  <span>{id}</span>
                  <button
                    onClick={() => handleRemoveId(id)}
                    className="text-red-300 hover:text-red-200 transition-colors"
                    title="삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {contents.length > 0 && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
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

              <button
                onClick={downloadMarkdown}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-all
                         bg-gradient-to-r from-orange-500 to-red-600 text-white
                         hover:shadow-lg hover:shadow-orange-500/50
                         flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                다운로드
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
            <p className="text-white/70 text-lg">로딩 중...</p>
          </div>
        )}

        {/* Results */}
        {!loading && contents.length > 0 && (
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

            {/* Contents Cards */}
            <div className="grid gap-4">
              {contents.map((content) => (
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
                      <span className="mr-2">🆔</span>
                      <span className="text-white/60">ID: </span>
                      <span>{content.id}</span>
                    </div>
                    <div className="text-white/80">
                      <span className="mr-2">👤</span>
                      <span className="text-white/60">작성자: </span>
                      <a
                        href={`/contentslist/${encodeURIComponent(content.author)}`}
                        className="text-blue-300 hover:text-blue-200 hover:underline"
                      >
                        {content.author}
                      </a>
                    </div>
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
        {!loading && contents.length === 0 && idList.length === 0 && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
            <p className="text-white/70 text-lg">
              ID 또는 URL을 입력하고 입력하기 버튼을 눌러주세요.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
