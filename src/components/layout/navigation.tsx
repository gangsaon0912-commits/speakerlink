'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, profile, logout, isAuthenticated, loading } = useAuth()

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return // 중복 호출 방지
    
    console.log('🚪 Logout button clicked')
    setIsLoggingOut(true)
    
    try {
      // 즉시 브라우저 스토리지 정리
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('speakerlink')) {
            localStorage.removeItem(key)
            console.log('🗑️ Removed from localStorage:', key)
          }
        })
        
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('speakerlink')) {
            sessionStorage.removeItem(key)
            console.log('🗑️ Removed from sessionStorage:', key)
          }
        })
        
        console.log('✅ Browser storage cleared immediately')
      }
      
      // 로그아웃 함수 호출
      const result = await logout()
      console.log('✅ Logout result:', result)
      
      // 성공 여부와 관계없이 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      // 에러가 있어도 강제로 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } finally {
      setIsLoggingOut(false)
    }
  }, [logout, isLoggingOut])

  const menuItems = [
    { href: '/projects', label: '프로젝트' },
    { href: '/announcements', label: '공지사항' },
    { href: '/documents', label: '문서 관리' },
    { href: '/about', label: '소개' },
  ]

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">강사온스쿨</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">확인 중...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* 사용자 정보 표시 */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {profile?.full_name || user?.email}님
                </div>
                
                {/* 관리자 버튼 */}
                {(profile?.user_type === 'admin' || user?.email === 'admin@test.com') && (
                  <Link href="/admin">
                    <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white">
                      관리자
                    </Button>
                  </Link>
                )}
                
                {/* 일반 사용자 프로필 버튼 */}
                {profile?.user_type !== 'admin' && (
                  <Link href="/profile">
                    <Button variant="ghost">프로필</Button>
                  </Link>
                )}
                
                {/* 로그아웃 버튼 */}
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button>회원가입</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">확인 중...</span>
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    {/* 사용자 정보 표시 */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 px-3 py-2">
                      {profile?.full_name || user?.email}님
                    </div>
                    
                    {/* 관리자 버튼 */}
                    {(profile?.user_type === 'admin' || user?.email === 'admin@test.com') && (
                      <Link href="/admin">
                        <Button variant="default" className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                          관리자
                        </Button>
                      </Link>
                    )}
                    
                    {/* 일반 사용자 프로필 버튼 */}
                    {profile?.user_type !== 'admin' && (
                      <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start">
                          프로필
                        </Button>
                      </Link>
                    )}
                    
                    {/* 로그아웃 버튼 */}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20" 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full justify-start">
                        회원가입
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
