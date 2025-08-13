import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signIn, signUp, signOut, getProfile } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const router = useRouter()
  const mountedRef = useRef(true)
  const initializedRef = useRef(false)

  // 로컬 환경에서만 디버그 로그 출력
  const isLocalEnv = process.env.NODE_ENV === 'development' && 
    (typeof window === 'undefined' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const debugLog = (...args: any[]) => {
    if (isLocalEnv) {
      console.log(...args)
    }
  }

  // 초기화 및 인증 상태 리스너
  useEffect(() => {
    debugLog('🚀 useAuth initialized')
    
    // 컴포넌트 마운트 상태 추적
    mountedRef.current = true
    initializedRef.current = false

    // 세션 확인 함수
    const checkSession = async () => {
      if (!mountedRef.current || initializedRef.current) return
      
      try {
        debugLog('🔍 Checking session...')
        
        // 로컬 스토리지에서 세션 데이터 확인
        if (typeof window !== 'undefined') {
          const storedSession = localStorage.getItem('speakerlink-auth')
          console.log('🔍 Local storage session data:', storedSession ? 'exists' : 'not found')
          
          if (storedSession) {
            try {
              const parsedSession = JSON.parse(storedSession)
              console.log('🔍 Parsed session data:', {
                hasAccessToken: !!parsedSession.access_token,
                hasRefreshToken: !!parsedSession.refresh_token,
                expiresAt: parsedSession.expires_at ? new Date(parsedSession.expires_at * 1000).toISOString() : 'undefined'
              })
            } catch (parseError) {
              console.error('❌ Failed to parse stored session:', parseError)
            }
          }
        }
        
        // 현재 세션 가져오기
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mountedRef.current) return
        
        if (error) {
          debugLog('❌ Session check error:', error)
          if (mountedRef.current) {
            setUser(null)
            setProfile(null)
            setLoading(false)
            setIsInitialized(true)
            initializedRef.current = true
          }
          return
        }

        if (session?.user) {
          debugLog('✅ Session found:', session.user.email)
          debugLog('🆔 User ID:', session.user.id)
          debugLog('🔑 Access token exists:', !!session.access_token)
          debugLog('🔄 Refresh token exists:', !!session.refresh_token)
          
          if (mountedRef.current) {
            setUser(session.user)
            setEmailVerified(!!session.user.email_confirmed_at)
          }
          
          // 프로필 가져오기
          try {
            console.log('📋 Fetching profile for user:', session.user.id)
            const userProfile = await getProfile(session.user.id)
            console.log('📋 Profile fetch result:', userProfile?.full_name || 'null')
            
            if (mountedRef.current) {
              setProfile(userProfile)
              console.log('✅ Profile set in state:', userProfile?.full_name)
            }
          } catch (profileError) {
            console.error('❌ Profile fetch error:', profileError)
            if (mountedRef.current) {
              setProfile(null)
            }
          }
        } else {
          console.log('❌ No session found')
          
          // 세션이 없을 때 로컬 스토리지에서 복구 시도
          if (typeof window !== 'undefined') {
            const storedSession = localStorage.getItem('speakerlink-auth')
            if (storedSession) {
              try {
                const parsedSession = JSON.parse(storedSession)
                if (parsedSession.access_token && parsedSession.refresh_token) {
                  console.log('🔄 Attempting to recover session from storage...')
                  
                  // 토큰 갱신 시도
                  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                    refresh_token: parsedSession.refresh_token
                  })
                  
                  if (refreshError) {
                    console.error('❌ Session recovery failed:', refreshError)
                  } else if (refreshData.session?.user) {
                    console.log('✅ Session recovered successfully:', refreshData.session.user.email)
                    
                    if (mountedRef.current) {
                      setUser(refreshData.session.user)
                      setEmailVerified(!!refreshData.session.user.email_confirmed_at)
                      
                      // 프로필 가져오기
                      try {
                        const userProfile = await getProfile(refreshData.session.user.id)
                        if (mountedRef.current) {
                          setProfile(userProfile)
                        }
                      } catch (profileError) {
                        console.error('❌ Profile fetch error after recovery:', profileError)
                        if (mountedRef.current) {
                          setProfile(null)
                        }
                      }
                    }
                  }
                }
              } catch (parseError) {
                console.error('❌ Failed to parse stored session for recovery:', parseError)
              }
            }
          }
          
          if (mountedRef.current) {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('❌ Session check exception:', error)
        if (mountedRef.current) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setIsInitialized(true)
          initializedRef.current = true
          console.log('✅ Session check complete')
        }
      }
    }

    // 초기 세션 확인
    checkSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email)
        console.log('🔄 Session tokens:', {
          accessToken: !!session?.access_token,
          refreshToken: !!session?.refresh_token,
          expiresAt: session?.expires_at
        })
        
        if (!mountedRef.current) return

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.email)
          if (mountedRef.current) {
            setUser(session.user)
            setEmailVerified(!!session.user.email_confirmed_at)
            setLoading(false)
          }
          
          // 프로필 가져오기
          try {
            console.log('📋 Fetching profile on sign in for user:', session.user.id)
            const userProfile = await getProfile(session.user.id)
            console.log('📋 Profile fetch result:', userProfile?.full_name || 'null')
            
            if (mountedRef.current) {
              setProfile(userProfile)
              console.log('✅ Profile set in state:', userProfile?.full_name)
            }
          } catch (profileError) {
            console.error('❌ Profile fetch error:', profileError)
            if (mountedRef.current) {
              setProfile(null)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out')
          if (mountedRef.current) {
            setUser(null)
            setProfile(null)
            setEmailVerified(false)
            setLoading(false)
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed:', session.user.email)
          if (mountedRef.current) {
            setUser(session.user)
            // 토큰 갱신 후 프로필도 다시 가져오기
            try {
              const userProfile = await getProfile(session.user.id)
              if (mountedRef.current) {
                setProfile(userProfile)
              }
            } catch (error) {
              console.error('❌ Profile fetch error after token refresh:', error)
            }
          }
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          console.log('🎯 Initial session:', session.user.email)
          if (mountedRef.current) {
            setUser(session.user)
            setEmailVerified(!!session.user.email_confirmed_at)
            setLoading(false)
          }
          
          // 프로필 가져오기
          try {
            console.log('📋 Fetching profile on initial session for user:', session.user.id)
            const userProfile = await getProfile(session.user.id)
            console.log('📋 Profile fetch result:', userProfile?.full_name || 'null')
            
            if (mountedRef.current) {
              setProfile(userProfile)
              console.log('✅ Profile set in state:', userProfile?.full_name)
            }
          } catch (error) {
            console.error('❌ Profile error on initial session:', error)
            if (mountedRef.current) {
              setProfile(null)
            }
          }
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log('👤 User updated:', session.user.email)
          if (mountedRef.current) {
            setUser(session.user)
          }
        }
      }
    )

    // 안전장치: 2초 후 강제로 로딩 해제
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && loading && !initializedRef.current) {
        console.log('⏰ Force loading to false')
        setLoading(false)
        setIsInitialized(true)
        initializedRef.current = true
      }
    }, 2000)

    return () => {
      console.log('🧹 useAuth cleanup')
      mountedRef.current = false
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, []) // 의존성 배열을 비워서 한 번만 실행되도록 함

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🚀 Login attempt:', email)
      setLoading(true)
      
      const result = await signIn({ email, password })
      
      if (result.success) {
        console.log('✅ Login successful:', email)
        // 세션 확인을 위해 잠시 대기
        setTimeout(() => {
          // checkSession() // 이제 useEffect에서 처리
        }, 300)
      } else {
        console.error('❌ Login failed:', result.error?.message)
        setLoading(false)
      }
      
      return result
    } catch (error) {
      console.error('❌ Login exception:', error)
      setLoading(false)
      return { success: false, error: { message: '로그인 중 오류가 발생했습니다.' } }
    }
  }, []) // checkSession 제거

  const register = useCallback(async (email: string, password: string, fullName: string, userType: 'instructor' | 'company') => {
    try {
      console.log('📝 Register attempt:', email)
      const result = await signUp({ email, password, fullName, userType })
      
      if (result.success) {
        console.log('✅ Registration successful')
        router.push('/login?message=회원가입이 완료되었습니다. 이메일을 확인해주세요.')
      } else {
        console.log('❌ Registration failed:', result.error?.message)
      }
      
      return result
    } catch (error) {
      console.error('❌ Registration error:', error)
      return { success: false, error: { message: '회원가입 중 오류가 발생했습니다.' } }
    }
  }, [router])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      console.log('📝 Updating profile:', updates)
      console.log('🔍 Current user:', user)
      
      if (!user?.id) {
        console.error('❌ No user ID for profile update')
        return { success: false, error: { message: '사용자 정보가 없습니다.' } }
      }
      
      // 프로필 업데이트
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      
      if (error) {
        console.error('❌ Profile update error:', error)
        return { success: false, error: { message: '프로필 업데이트에 실패했습니다.' } }
      }
      
      // 로컬 상태 업데이트
      if (profile) {
        const updatedProfile = { ...profile, ...updates }
        setProfile(updatedProfile)
        console.log('✅ Profile updated in state:', updatedProfile)
      }
      
      return { success: true }
    } catch (error) {
      console.error('❌ Profile update exception:', error)
      return { success: false, error: { message: '프로필 업데이트 중 오류가 발생했습니다.' } }
    }
  }, [user?.id, profile])

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logout attempt')
      
      // 즉시 상태 초기화
      setUser(null)
      setProfile(null)
      setEmailVerified(false)
      setLoading(false)
      
      // 브라우저 스토리지 즉시 정리
      if (typeof window !== 'undefined') {
        try {
          // 모든 Supabase 관련 데이터 제거
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('speakerlink')) {
              localStorage.removeItem(key)
              console.log('Removed from localStorage:', key)
            }
          })
          
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('speakerlink')) {
              sessionStorage.removeItem(key)
              console.log('Removed from sessionStorage:', key)
            }
          })
          
          console.log('✅ Browser storage cleared')
        } catch (storageError) {
          console.error('Storage clear error:', storageError)
        }
      }
      
      // 로그아웃 함수 호출 (에러 무시)
      try {
        const result = await signOut()
        console.log('✅ SignOut completed:', result.success)
      } catch (signOutError) {
        console.error('SignOut error:', signOutError)
        console.log('SignOut error ignored, continuing...')
      }
      
      // 강제로 로그인 페이지로 이동
      console.log('🚀 Redirecting to login page...')
      router.push('/login')
      
      return { success: true }
    } catch (error) {
      console.error('❌ Logout error:', error)
      // 모든 에러를 무시하고 성공으로 처리
      setUser(null)
      setProfile(null)
      setEmailVerified(false)
      setLoading(false)
      router.push('/login')
      return { success: true }
    }
  }, [router])

  const isAuthenticated = !!user?.id

  console.log('🔍 useAuth state:', {
    user: user?.email,
    userId: user?.id,
    profile: !!profile,
    loading,
    isInitialized,
    isAuthenticated,
    emailVerified,
    mounted: mountedRef.current,
    initialized: initializedRef.current
  })

  return {
    user,
    profile,
    loading,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    emailVerified,
  }
}
