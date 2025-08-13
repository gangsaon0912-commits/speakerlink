import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signIn, signUp, signOut, getProfile } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/auth'

// 상수 정의
const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 2000,
  SESSION_RECOVERY_DELAY: 500
} as const

// 에러 타입 정의
type AuthError = {
  message: string
  code?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const router = useRouter()
  
  // Refs
  const mountedRef = useRef(true)
  const initializedRef = useRef(false)
  const profileCacheRef = useRef<Map<string, { profile: Profile; timestamp: number }>>(new Map())
  
  // 캐시 만료 시간 (5분)
  const CACHE_EXPIRY = 5 * 60 * 1000

  // 로컬 환경에서만 디버그 로그 출력
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const debugLog = (...args: any[]) => {
    if (isLocalEnv) {
      console.log(...args)
    }
  }

  // 유틸리티 함수들
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_EXPIRY
  }

  const clearProfileCache = () => {
    profileCacheRef.current.clear()
    debugLog('🧹 Profile cache cleared')
  }

  // 프로필 로딩 함수
  const loadProfile = async (userId: string, context: string = 'unknown'): Promise<Profile | null> => {
    if (!mountedRef.current) return null
    
    debugLog(`📋 Loading profile for user: ${userId} (context: ${context})`)
    
    // 캐시된 프로필 확인
    const cached = profileCacheRef.current.get(userId)
    if (cached && isCacheValid(cached.timestamp)) {
      debugLog('📋 Using cached profile for user:', userId)
      return cached.profile
    }
    
    // 세션 토큰 확인 및 갱신
    let { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      debugLog('❌ No access token available for profile loading')
      
      // 토큰이 없으면 갱신 시도
      try {
        debugLog('🔄 Attempting to refresh session...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          debugLog('❌ Session refresh failed:', refreshError)
          return null
        }
        
        if (refreshData.session?.access_token) {
          session = refreshData.session
          debugLog('✅ Session refreshed successfully')
        } else {
          debugLog('❌ No session after refresh')
          return null
        }
      } catch (refreshError) {
        debugLog('❌ Session refresh exception:', refreshError)
        return null
      }
    }
    
    debugLog('🔑 Access token available, length:', session.access_token.length)
    debugLog('🔑 Token preview:', session.access_token.substring(0, 20) + '...')
    
    let userProfile = null
    let retryCount = 0
    
    while (retryCount < RETRY_CONFIG.MAX_RETRIES && !userProfile && mountedRef.current) {
      try {
        debugLog(`📋 Profile loading attempt ${retryCount + 1}/${RETRY_CONFIG.MAX_RETRIES}`)
        
        // 각 시도마다 세션 재확인
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!currentSession?.access_token) {
          debugLog('❌ Session lost during profile loading')
          break
        }
        
        userProfile = await getProfile(userId)
        
        if (userProfile) {
          debugLog('✅ Profile loaded successfully:', userProfile.full_name)
          profileCacheRef.current.set(userId, {
            profile: userProfile,
            timestamp: Date.now()
          })
          debugLog('💾 Profile cached for user:', userId)
          break
        } else {
          debugLog(`⚠️ Profile not found, retrying... (${retryCount + 1}/${RETRY_CONFIG.MAX_RETRIES})`)
          retryCount++
          if (retryCount < RETRY_CONFIG.MAX_RETRIES) {
            await sleep(RETRY_CONFIG.RETRY_DELAY)
          }
        }
      } catch (error) {
        debugLog(`❌ Profile loading error (attempt ${retryCount + 1}):`, error)
        retryCount++
        if (retryCount < RETRY_CONFIG.MAX_RETRIES) {
          await sleep(RETRY_CONFIG.RETRY_DELAY)
        }
      }
    }
    
    if (!userProfile) {
      debugLog('❌ Profile loading failed after all retries')
      debugLog('🔍 Final session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userId: userId
      })
      
      // 프로필 로딩 실패 시 캐시 무효화
      clearProfileCache()
    }
    
    return userProfile
  }

  // 강제로 프로필을 다시 가져오는 함수
  const refreshProfile = async () => {
    try {
      debugLog('🔄 Forcing profile refresh...')
      
      if (!user?.id) {
        debugLog('❌ No user ID for profile refresh')
        return { success: false, error: { message: '사용자 정보가 없습니다.' } }
      }
      
      // 캐시 무효화
      clearProfileCache()
      
      // 세션 토큰 확인 및 갱신
      let { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        debugLog('🔄 No access token, attempting session refresh...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          debugLog('❌ Session refresh failed:', refreshError)
          return { success: false, error: { message: '세션이 만료되었습니다.' } }
        }
        
        if (refreshData.session?.access_token) {
          session = refreshData.session
          debugLog('✅ Session refreshed successfully')
        } else {
          debugLog('❌ No session after refresh')
          return { success: false, error: { message: '세션이 만료되었습니다.' } }
        }
      }
      
      debugLog('🔑 Access token exists for refresh, length:', session.access_token.length)
      
      // 프로필 로딩
      const userProfile = await loadProfile(user.id, 'manual-refresh')
      
      if (userProfile) {
        setProfile(userProfile)
        debugLog('✅ Profile refreshed successfully:', userProfile.full_name)
        return { success: true }
      } else {
        debugLog('❌ Profile refresh failed: no profile returned')
        return { success: false, error: { message: '프로필을 가져올 수 없습니다.' } }
      }
    } catch (error) {
      console.error('❌ Profile refresh exception:', error)
      return { success: false, error: { message: '프로필 새로고침 중 오류가 발생했습니다.' } }
    }
  }

  const logout = useCallback(async () => {
    try {
      await signOut()
      setUser(null)
      setProfile(null)
      setEmailVerified(false)
      clearProfileCache()
      router.push('/')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }, [router])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      if (!profile?.id) {
        throw new Error('No profile to update')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // 로컬 상태 업데이트 및 캐시 무효화
      if (data) {
        const updatedProfile = { ...profile, ...data }
        setProfile(updatedProfile)
        debugLog('✅ Profile updated in state:', updatedProfile)
        
        // 캐시 무효화
        clearProfileCache()
      }

      return { success: true, data }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      return { success: false, error }
    }
  }, [profile])

  // 초기화 및 인증 상태 리스너
  useEffect(() => {
    debugLog('🚀 useAuth initialized')
    
    // 컴포넌트 마운트 상태 추적
    mountedRef.current = true
    initializedRef.current = false

    // 초기화 실행
    const initializeAuth = async () => {
      if (!mountedRef.current || initializedRef.current) return
      
      try {
        debugLog('🔍 Initializing auth...')
        
        // 현재 세션 확인 (가장 먼저)
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
          
          // 프로필 로딩 (즉시)
          const userProfile = await loadProfile(session.user.id, 'initial-session')
          
          if (mountedRef.current) {
            setProfile(userProfile)
            debugLog('✅ Profile set in state:', userProfile?.full_name)
          }
        } else {
          debugLog('❌ No session found, attempting recovery...')
          
          // 세션이 없을 때 로컬 스토리지에서 복구 시도
          if (typeof window !== 'undefined') {
            const storedSession = localStorage.getItem('speakerlink-auth')
            if (storedSession) {
              try {
                const parsedSession = JSON.parse(storedSession)
                if (parsedSession.access_token && parsedSession.refresh_token) {
                  debugLog('🔄 Attempting to recover session from storage...')
                  
                  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                    refresh_token: parsedSession.refresh_token
                  })
                  
                  if (refreshError) {
                    debugLog('❌ Session recovery failed:', refreshError)
                    localStorage.removeItem('speakerlink-auth')
                  } else if (refreshData.session?.user) {
                    debugLog('✅ Session recovered successfully:', refreshData.session.user.email)
                    
                    if (mountedRef.current) {
                      setUser(refreshData.session.user)
                      setEmailVerified(!!refreshData.session.user.email_confirmed_at)
                      
                      // 세션 복구 후 즉시 프로필 로딩
                      const userProfile = await loadProfile(refreshData.session.user.id, 'session-recovery')
                      
                      if (mountedRef.current) {
                        setProfile(userProfile)
                        debugLog('✅ Profile set in state after recovery:', userProfile?.full_name)
                      }
                    }
                  }
                }
              } catch (parseError) {
                console.error('❌ Failed to parse stored session for recovery:', parseError)
                localStorage.removeItem('speakerlink-auth')
              }
            }
          }
          
          if (mountedRef.current) {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization exception:', error)
        if (mountedRef.current) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          setIsInitialized(true)
          initializedRef.current = true
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setIsInitialized(true)
          initializedRef.current = true
          debugLog('✅ Auth initialization complete')
        }
      }
    }

    // 초기화 실행
    initializeAuth()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugLog('🔄 Auth state change:', event, session?.user?.email)
        debugLog('🔄 Session tokens:', {
          accessToken: !!session?.access_token,
          refreshToken: !!session?.refresh_token,
          expiresAt: session?.expires_at
        })
        
        if (!mountedRef.current) return

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              debugLog('✅ User signed in:', session.user.email)
              if (mountedRef.current) {
                setUser(session.user)
                setEmailVerified(!!session.user.email_confirmed_at)
                setLoading(false)
              }
              
              // 프로필 로딩
              const userProfile = await loadProfile(session.user.id, 'sign-in')
              
              if (mountedRef.current) {
                setProfile(userProfile)
                debugLog('✅ Profile set in state:', userProfile?.full_name)
              }
            }
            break

          case 'SIGNED_OUT':
            debugLog('🚪 User signed out')
            if (mountedRef.current) {
              setUser(null)
              setProfile(null)
              setEmailVerified(false)
              setLoading(false)
            }
            
            // 로그아웃 시 캐시 및 스토리지 정리
            clearProfileCache()
            if (typeof window !== 'undefined') {
              localStorage.removeItem('speakerlink-auth')
            }
            break

          case 'TOKEN_REFRESHED':
            if (session?.user) {
              debugLog('🔄 Token refreshed:', session.user.email)
              if (mountedRef.current) {
                setUser(session.user)
                
                // 토큰 갱신 시 캐시 무효화
                clearProfileCache()
                
                // 프로필 다시 가져오기
                try {
                  const userProfile = await loadProfile(session.user.id, 'token-refresh')
                  if (mountedRef.current) {
                    setProfile(userProfile)
                  }
                } catch (error) {
                  console.error('❌ Profile fetch error after token refresh:', error)
                }
              }
            }
            break

          case 'INITIAL_SESSION':
            if (session?.user) {
              debugLog('🎯 Initial session:', session.user.email)
              if (mountedRef.current) {
                setUser(session.user)
                setEmailVerified(!!session.user.email_confirmed_at)
                setLoading(false)
              }
              
              // 프로필 로딩 (즉시)
              try {
                const userProfile = await loadProfile(session.user.id, 'initial-session')
                
                if (mountedRef.current) {
                  setProfile(userProfile)
                  debugLog('✅ Profile set in state:', userProfile?.full_name)
                }
              } catch (error) {
                console.error('❌ Profile error on initial session:', error)
                if (mountedRef.current) {
                  setProfile(null)
                }
              }
            } else {
              debugLog('🎯 Initial session: no session')
              if (mountedRef.current) {
                setUser(null)
                setProfile(null)
                setLoading(false)
              }
            }
            break

          case 'USER_UPDATED':
            if (session?.user) {
              debugLog('👤 User updated:', session.user.email)
              if (mountedRef.current) {
                setUser(session.user)
              }
            }
            break

          case 'MFA_CHALLENGE_VERIFIED':
            if (session?.user) {
              debugLog('🔐 MFA challenge verified:', session.user.email)
              if (mountedRef.current) {
                setUser(session.user)
                setEmailVerified(!!session.user.email_confirmed_at)
              }
            }
            break

          default:
            debugLog('🔄 Unhandled auth event:', event)
            break
        }
      }
    )

    // 컴포넌트 언마운트 시 정리
    return () => {
      mountedRef.current = false
      subscription?.unsubscribe()
    }
  }, [])

  const isAuthenticated = !!user?.id

  debugLog('🔍 useAuth state:', {
    user: user?.email,
    userId: user?.id,
    profile: !!profile,
    profileName: profile?.full_name,
    loading,
    isInitialized,
    isAuthenticated,
    emailVerified,
    mounted: mountedRef.current,
    initialized: initializedRef.current,
    cacheSize: profileCacheRef.current.size
  })

  // login 함수를 signIn과 호환되도록 래핑
  const login = async (email: string, password: string) => {
    return await signIn({ email, password })
  }

  // register 함수를 signUp과 호환되도록 래핑
  const register = async (email: string, password: string, fullName: string, userType: 'instructor' | 'company') => {
    return await signUp({ email, password, fullName, userType })
  }

  return {
    user,
    profile,
    loading,
    isInitialized,
    isAuthenticated,
    emailVerified,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile
  }
}
