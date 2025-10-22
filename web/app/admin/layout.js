'use client'

import { useState, useEffect, createContext, useContext } from 'react'

// Create Auth Context
const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

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
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-md w-full mx-4 p-8 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <span>🛡️</span>
              <span>관리자 로그인</span>
            </h1>
            <p className="text-white/70 mt-3">관리자 페이지에 접근하려면 비밀번호를 입력하세요</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20
                         text-white placeholder-white/50
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                         transition-all"
                placeholder="관리자 비밀번호를 입력하세요"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold
                       bg-gradient-to-r from-blue-500 to-purple-600 text-white
                       shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50
                       transition-all duration-300"
            >
              로그인
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              메인 페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}