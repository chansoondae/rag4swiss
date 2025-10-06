'use client'

import { useState, useEffect } from 'react'

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken === 'admin_logged_in') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    // Simple password check (in production, use proper authentication)
    if (password === 'swiss2024') {
      localStorage.setItem('admin_token', 'admin_logged_in')
      setIsAuthenticated(true)
    } else {
      alert('잘못된 비밀번호입니다.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🔐</div>
          <div className="mt-2 text-gray-600">인증 확인 중...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">🛡️ 관리자 로그인</h1>
            <p className="text-gray-600 mt-2">관리자 페이지에 접근하려면 비밀번호를 입력하세요</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="관리자 비밀번호를 입력하세요"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              로그인
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a 
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              메인 페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Logout button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
      {children}
    </div>
  )
}