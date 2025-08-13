'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { getProfile } from '@/lib/auth'

export function DebugAuth() {
  const { user, profile, loading, isAuthenticated, isInitialized } = useAuth()

  useEffect(() => {
    console.log('🔍 DebugAuth - State changed:', {
      user: user?.email,
      profile: !!profile,
      loading,
      isAuthenticated,
      isInitialized
    })
  }, [user, profile, loading, isAuthenticated, isInitialized])

  const handleRefreshProfile = async () => {
    if (user?.id) {
      console.log('🔄 강제 프로필 새로고침...')
      try {
        const newProfile = await getProfile(user.id)
        console.log('📋 새 프로필:', newProfile)
        if (newProfile) {
          // 프로필 상태 업데이트는 useAuth 훅에서 처리됨
          console.log('✅ 프로필 새로고침 완료')
        }
      } catch (error) {
        console.error('❌ 프로필 새로고침 실패:', error)
      }
    }
  }

  const handleRefreshAuth = async () => {
    console.log('🔄 강제 인증 상태 새로고침...')
    try {
      // 브라우저 스토리지 정리
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        console.log('✅ 브라우저 스토리지 정리 완료')
      }
      
      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error('❌ 인증 상태 새로고침 실패:', error)
    }
  }

  // 로컬 환경에서만 표시 (개발 환경 + localhost)
  const isLocalEnv = process.env.NODE_ENV === 'development' && 
    (typeof window === 'undefined' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  if (!isLocalEnv) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>🔍 Auth Debug</div>
      <div>User: {user?.email || 'null'}</div>
      <div>Profile: {profile ? '✅' : '❌'}</div>
      <div>Loading: {loading ? '⏳' : '✅'}</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
      {user && !profile && (
        <button 
          onClick={handleRefreshProfile}
          style={{
            marginTop: '5px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          프로필 새로고침
        </button>
      )}
      <button 
        onClick={handleRefreshAuth}
        style={{
          marginTop: '5px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          cursor: 'pointer'
        }}
      >
        인증 초기화
      </button>
    </div>
  )
}
