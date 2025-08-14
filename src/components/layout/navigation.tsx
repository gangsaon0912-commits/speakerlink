'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LogoWithText, LogoCompact } from '@/components/ui/logo'

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

  // 로그인 상태에 따른 메뉴 아이템
  const getMenuItems = () => {
    const baseItems = [
      { href: '/projects', label: '강사공고' },
      { href: '/announcements', label: '공지사항' },
      { href: '/about', label: '소개' },
    ]
    
    // 로그인한 사용자에게만 문서 관리 메뉴 표시
    if (isAuthenticated) {
      baseItems.splice(2, 0, { href: '/documents', label: '문서 관리' })
    }
    
    return baseItems
  }

  const menuItems = getMenuItems()

  return (
            <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="hidden md:block">
              <LogoWithText size="md" />
            </div>
            <div className="md:hidden">
              <LogoCompact size="sm" />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
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
                <div className="text-sm text-gray-600">
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
                  className="border-red-200 text-red-600 hover:bg-red-50"
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
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">확인 중...</span>
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    {/* 사용자 정보 표시 */}
                    <div className="text-sm text-gray-600 px-3 py-2">
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
                      className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50" 
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
