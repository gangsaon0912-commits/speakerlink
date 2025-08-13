import { supabase } from './supabase'
import { Database } from './supabase'
import { createClient } from '@supabase/supabase-js'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Instructor = Database['public']['Tables']['instructors']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Project = Database['public']['Tables']['projects']['Row']

export interface SignUpData {
  email: string
  password: string
  fullName: string
  userType: 'instructor' | 'company'
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthError {
  message: string
}

// 회원가입
export async function signUp(data: SignUpData): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📧 Starting signup process for:', data.email)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email`,
        data: {
          full_name: data.fullName,
          user_type: data.userType,
        }
      }
    })

    if (authError) {
      console.error('❌ Signup auth error:', authError)
      return { success: false, error: { message: authError.message } }
    }

    if (authData.user) {
      console.log('✅ User created successfully:', authData.user.email)
      console.log('📧 Email confirmation sent:', authData.user.email_confirmed_at ? 'Already confirmed' : 'Pending confirmation')
      
      // 프로필 생성
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          user_type: data.userType,
          email_verified: false, // 이메일 인증 대기 상태
        })

      if (profileError) {
        console.error('❌ Profile creation error:', profileError)
        return { success: false, error: { message: profileError.message } }
      }

      console.log('✅ Profile created successfully')
      
      // 이메일 인증이 발송되었는지 확인
      if (!authData.user.email_confirmed_at) {
        console.log('📧 Email confirmation email has been sent')
        return { 
          success: true, 
          error: { 
            message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.' 
          } 
        }
      }

      return { success: true }
    }

    console.error('❌ Signup failed: no user data')
    return { success: false, error: { message: '회원가입에 실패했습니다.' } }
  } catch (error) {
    console.error('❌ Signup exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 로그인
export async function signIn(data: LoginData): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('signIn called with email:', data.email)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    console.log('signInWithPassword result:', { 
      user: !!authData?.user, 
      session: !!authData?.session, 
      error: authError?.message 
    })

    if (authError) {
      console.error('signIn auth error:', authError)
      return { success: false, error: { message: authError.message } }
    }

    if (authData.user && authData.session) {
      console.log('signIn successful, user:', authData.user.email)
      console.log('🔑 Access token length:', authData.session.access_token.length)
      console.log('🔄 Refresh token length:', authData.session.refresh_token.length)
      console.log('⏰ Expires at:', authData.session.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : 'undefined')
      
      // 세션이 제대로 저장되었는지 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('✅ Session confirmed after login')
        console.log('✅ Stored session access token length:', session.access_token.length)
      } else {
        console.warn('⚠️ Session not found after login')
      }
      
      // 로컬 스토리지 확인 및 강제 저장
      if (typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('speakerlink-auth')
        console.log('🔍 Local storage session exists:', !!storedSession)
        
        // 세션이 있지만 로컬 스토리지에 없는 경우 강제 저장
        if (authData.session && !storedSession) {
          console.log('🔄 Forcing session to localStorage...')
          localStorage.setItem('speakerlink-auth', JSON.stringify({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at,
            expires_in: authData.session.expires_in,
            token_type: authData.session.token_type,
            user: authData.session.user
          }))
          console.log('✅ Session forced to localStorage')
        }
      }
      
      return { success: true }
    }

    console.error('signIn failed: no user data or session')
    return { success: false, error: { message: '로그인에 실패했습니다.' } }
  } catch (error) {
    console.error('signIn exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 로그아웃
export async function signOut(): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('signOut called')
    
    // 브라우저 스토리지만 정리 (Supabase 호출 제거)
    if (typeof window !== 'undefined') {
      try {
        // 로컬 스토리지에서 Supabase 관련 데이터 정리
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('supabase')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))

        // 세션 스토리지에서 Supabase 관련 데이터 정리
        const sessionKeysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && key.includes('supabase')) {
            sessionKeysToRemove.push(key)
          }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

        console.log('Browser storage cleared for logout')
      } catch (storageError) {
        console.error('Error clearing storage:', storageError)
      }
    }

    console.log('signOut successful (browser storage only)')
    return { success: true }
  } catch (error) {
    console.error('signOut exception:', error)
    // 모든 예외를 무시하고 성공으로 처리
    console.log('SignOut exception occurred, but treating as success')
    return { success: true }
  }
}

// 현재 사용자 가져오기
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// 사용자 프로필 가져오기
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    console.log('🔍 getProfile called with userId:', userId)
    
    // 현재 세션에서 액세스 토큰 가져오기
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ getProfile: Session error:', sessionError)
      return null
    }
    
    if (!session?.access_token) {
      console.error('❌ getProfile: No access token in session')
      console.log('🔍 Session data:', session)
      return null
    }
    
    console.log('🔍 getProfile: Access token length:', session.access_token.length)
    console.log('🔍 getProfile: Access token preview:', session.access_token.substring(0, 20) + '...')
    
    // API 라우트를 통해 프로필 가져오기
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
    const apiUrl = `${origin}/api/profile`
    console.log('🔍 getProfile: Calling API:', apiUrl)
    
    const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
    console.log('🔍 getProfile: Request headers:', headers)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers
    })
    
    console.log('🔍 getProfile: Response status:', response.status)
    console.log('🔍 getProfile: Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ getProfile: API response not ok:', response.status, response.statusText)
      console.error('❌ getProfile: Error response body:', errorText)
      return null
    }
    
    const result = await response.json()
    
    console.log('🔍 getProfile: API response:', result)
    
    if (!result.success) {
      console.error('❌ getProfile: API returned error:', result.error)
      return null
    }
    
    console.log('✅ getProfile success:', result.data)
    console.log('✅ getProfile: returning profile with full_name:', result.data.full_name)
    return result.data
  } catch (error) {
    console.error('❌ getProfile exception:', error)
    console.error('❌ getProfile exception type:', typeof error)
    console.error('❌ getProfile exception message:', error instanceof Error ? error.message : error)
    return null
  }
}

// 강사 프로필 가져오기
export async function getInstructorProfile(userId: string): Promise<{ success: boolean; data: any | null; error?: AuthError }> {
  try {
    console.log('📋 Getting instructor profile for user:', userId)
    
    const { data, error } = await supabase
      .from('instructors')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('profile_id', userId)
      .single()

    if (error) {
      console.error('❌ Error getting instructor profile:', error)
      return { success: false, data: null, error: { message: error.message } }
    }

    console.log('✅ Instructor profile loaded successfully')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Exception getting instructor profile:', error)
    return { success: false, data: null, error: { message: '강사 프로필을 가져오는 중 오류가 발생했습니다.' } }
  }
}

// 강사 프로필 업데이트
export async function updateInstructorProfileData(userId: string, profileData: {
  full_name?: string
  bio?: string
  expertise?: string[]
  hourly_rate?: number
  location?: string
  experience?: string
  education?: string
  certifications?: string[]
  languages?: string[]
  availability?: string[]
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Updating instructor profile for user:', userId)
    console.log('📋 Profile data:', profileData)
    
    // 먼저 profiles 테이블 업데이트 (full_name만)
    const profileUpdateData: any = {}
    if (profileData.full_name) profileUpdateData.full_name = profileData.full_name

    if (Object.keys(profileUpdateData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId)

      if (profileError) {
        console.error('❌ Error updating profile:', profileError)
        return { success: false, error: { message: profileError.message } }
      }
    }

    // instructors 테이블 업데이트 (존재하는 필드만)
    const instructorUpdateData: any = {}
    if (profileData.bio) instructorUpdateData.bio = profileData.bio
    if (profileData.expertise) instructorUpdateData.expertise = profileData.expertise
    if (profileData.hourly_rate) instructorUpdateData.hourly_rate = profileData.hourly_rate
    if (profileData.location) instructorUpdateData.location = profileData.location
    if (profileData.availability) instructorUpdateData.availability = profileData.availability
    
               // 모든 필드 활성화
           if (profileData.experience) instructorUpdateData.experience = profileData.experience
           if (profileData.education) instructorUpdateData.education = profileData.education
           if (profileData.certifications) instructorUpdateData.certifications = profileData.certifications
           if (profileData.languages) instructorUpdateData.languages = profileData.languages

    if (Object.keys(instructorUpdateData).length > 0) {
      const { error: instructorError } = await supabase
        .from('instructors')
        .update(instructorUpdateData)
        .eq('profile_id', userId)

      if (instructorError) {
        console.error('❌ Error updating instructor:', instructorError)
        return { success: false, error: { message: instructorError.message } }
      }
    }

    console.log('✅ Instructor profile updated successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Exception updating instructor profile:', error)
    return { success: false, error: { message: '강사 프로필 업데이트 중 오류가 발생했습니다.' } }
  }
}

// 검증 요청 가져오기 (사용자용)
export async function getVerificationRequest(userId: string): Promise<{ success: boolean; data: any | null; error?: AuthError }> {
  try {
    console.log('📋 Getting verification request for user:', userId)
    
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error getting verification request:', error)
      return { success: false, data: null, error: { message: error.message } }
    }

    console.log('✅ Verification request loaded successfully')
    return { success: true, data: data || null }
  } catch (error) {
    console.error('❌ Exception getting verification request:', error)
    return { success: false, data: null, error: { message: '검증 요청을 가져오는 중 오류가 발생했습니다.' } }
  }
}

// 검증 요청 제출
export async function submitVerificationRequest(userId: string, userType: 'instructor' | 'company', profileData: any): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Submitting verification request for user:', userId)
    
    const { error } = await supabase
      .from('verification_requests')
      .insert({
        user_id: userId,
        user_type: userType,
        status: 'pending',
        profile_data: profileData,
        submitted_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Error submitting verification request:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('✅ Verification request submitted successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Exception submitting verification request:', error)
    return { success: false, error: { message: '검증 요청 제출 중 오류가 발생했습니다.' } }
  }
}

// 강사 프로필 생성 (새로운 강사 등록 시)
export async function createInstructorProfileData(userId: string, profileData: {
  full_name: string
  bio?: string
  expertise?: string[]
  hourly_rate?: number
  location?: string
  experience?: string
  education?: string
  certifications?: string[]
  languages?: string[]
  availability?: string[]
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Creating instructor profile for user:', userId)
    console.log('📋 Profile data:', profileData)
    
    // profiles 테이블 업데이트
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        location: profileData.location || '',
        user_type: 'instructor'
      })
      .eq('id', userId)

    if (profileError) {
      console.error('❌ Error updating profile:', profileError)
      return { success: false, error: { message: profileError.message } }
    }

    // instructors 테이블에 새 레코드 생성
    const { error: instructorError } = await supabase
      .from('instructors')
      .insert({
        profile_id: userId,
        bio: profileData.bio || '',
        expertise: profileData.expertise || [],
        hourly_rate: profileData.hourly_rate || 0,
        experience: profileData.experience || '',
        education: profileData.education || '',
        certifications: profileData.certifications || [],
        languages: profileData.languages || [],
        availability: profileData.availability || [],
        rating: 0,
        total_reviews: 0,
        is_verified: false
      })

    if (instructorError) {
      console.error('❌ Error creating instructor:', instructorError)
      return { success: false, error: { message: instructorError.message } }
    }

    console.log('✅ Instructor profile created successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Exception creating instructor profile:', error)
    return { success: false, error: { message: '강사 프로필 생성 중 오류가 발생했습니다.' } }
  }
}

// 회사 프로필 가져오기
export async function getCompanyProfile(profileId: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('profile_id', profileId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

// 강사 프로필 업데이트
export async function updateInstructorProfile(instructorId: string, data: {
  full_name?: string
  email?: string
  location?: string
  hourly_rate?: number
  bio?: string
  expertise?: string[]
  is_verified?: boolean
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('updateInstructorProfile called with:', { instructorId, data })
    
    // 현재 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Current user:', user?.email, 'Error:', userError)
    
    // JWT 토큰 정보 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session exists:', !!session, 'Session error:', sessionError)
    
    if (session?.access_token) {
      console.log('JWT token exists, user email from token:', session.user.email)
    }
    
    // 먼저 해당 강사가 존재하는지 확인
    const { data: existingInstructor, error: selectError } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', instructorId)
      .single()
    
    console.log('Existing instructor check:', { 
      exists: !!existingInstructor, 
      error: selectError,
      instructor: existingInstructor 
    })
    
    if (selectError) {
      console.error('Error checking existing instructor:', selectError)
      return { success: false, error: { message: `강사를 찾을 수 없습니다: ${selectError.message}` } }
    }
    
    const { error } = await supabase
      .from('instructors')
      .update({
        full_name: data.full_name,
        email: data.email,
        location: data.location,
        hourly_rate: data.hourly_rate,
        bio: data.bio,
        expertise: data.expertise,
        is_verified: data.is_verified,
        updated_at: new Date().toISOString()
      })
      .eq('id', instructorId)

    if (error) {
      console.error('updateInstructorProfile error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return { success: false, error: { message: error.message } }
    }

    console.log('updateInstructorProfile success')
    return { success: true }
  } catch (error) {
    console.error('updateInstructorProfile exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 강사 목록 가져오기
export async function getAllInstructors(): Promise<{ data: any[] | null; error?: any; success: boolean }> {
  try {
    console.log('📋 Fetching all instructors...')
    const { data, error } = await supabase
      .from('instructors')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          user_type
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching instructors:', error)
      return { data: null, error, success: false }
    }

    console.log('✅ Instructors fetched successfully:', data?.length || 0)
    return { data, success: true }
  } catch (error) {
    console.error('❌ Exception fetching instructors:', error)
    return { data: null, error, success: false }
  }
}

// 강사 프로필 삭제
export async function deleteInstructorProfile(instructorId: string): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('deleteInstructorProfile called with instructorId:', instructorId)
    
    const { error } = await supabase
      .from('instructors')
      .delete()
      .eq('id', instructorId)

    if (error) {
      console.error('deleteInstructorProfile error:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('deleteInstructorProfile success')
    return { success: true }
  } catch (error) {
    console.error('deleteInstructorProfile exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 검증 요청 목록 가져오기
export async function getVerificationRequests(): Promise<{ data: any[] | null; error?: AuthError }> {
  try {
    console.log('getVerificationRequests called')
    
    // 먼저 verification_requests를 가져옴
    const { data: verificationRequests, error: vrError } = await supabase
      .from('verification_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (vrError) {
      console.error('getVerificationRequests error:', vrError)
      return { data: null, error: { message: vrError.message } }
    }

    // 각 verification request에 대해 profile 정보를 가져옴
    const enrichedData = await Promise.all(
      verificationRequests?.map(async (request) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, email, user_type')
          .eq('id', request.user_id)
          .single()

        return {
          ...request,
          user_profile: profileData
        }
      }) || []
    )

    console.log('getVerificationRequests success, count:', enrichedData?.length)
    return { data: enrichedData }
  } catch (error) {
    console.error('getVerificationRequests exception:', error)
    return { data: null, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 검증 요청 승인
export async function approveVerificationRequest(requestId: string, reviewerEmail: string): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('approveVerificationRequest called with:', { requestId, reviewerEmail })
    
    // reviewerEmail로 사용자 ID 찾기 (profiles 테이블에서)
    const { data: reviewerProfile, error: reviewerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', reviewerEmail)
      .single()
    
    if (reviewerError || !reviewerProfile) {
      console.error('Reviewer not found:', reviewerEmail, reviewerError)
      return { success: false, error: { message: '리뷰어를 찾을 수 없습니다.' } }
    }
    
    // 검증 요청 정보 가져오기 (활동 로그용)
    const { data: request, error: requestError } = await supabase
      .from('verification_requests')
      .select('*, profiles!inner(*)')
      .eq('id', requestId)
      .single()

    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerProfile.id
      })
      .eq('id', requestId)

    if (error) {
      console.error('approveVerificationRequest error:', error)
      return { success: false, error: { message: error.message } }
    }

    // 활동 로그 생성
    if (request && request.profiles) {
      await logVerificationApproved(request.profiles.name || '강사', request.profiles.id)
    }

    console.log('approveVerificationRequest success')
    return { success: true }
  } catch (error) {
    console.error('approveVerificationRequest exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 검증 요청 거부
export async function rejectVerificationRequest(requestId: string, reviewerEmail: string, rejectionReason: string): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('rejectVerificationRequest called with:', { requestId, reviewerEmail, rejectionReason })
    
    // reviewerEmail로 사용자 ID 찾기 (profiles 테이블에서)
    const { data: reviewerProfile, error: reviewerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', reviewerEmail)
      .single()
    
    if (reviewerError || !reviewerProfile) {
      console.error('Reviewer not found:', reviewerEmail, reviewerError)
      return { success: false, error: { message: '리뷰어를 찾을 수 없습니다.' } }
    }
    
    // 검증 요청 정보 가져오기 (활동 로그용)
    const { data: request, error: requestError } = await supabase
      .from('verification_requests')
      .select('*, profiles!inner(*)')
      .eq('id', requestId)
      .single()

    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerProfile.id,
        rejection_reason: rejectionReason
      })
      .eq('id', requestId)

    if (error) {
      console.error('rejectVerificationRequest error:', error)
      return { success: false, error: { message: error.message } }
    }

    // 활동 로그 생성
    if (request && request.profiles) {
      await logVerificationRejected(request.profiles.name || '강사', request.profiles.id)
    }

    console.log('rejectVerificationRequest success')
    return { success: true }
  } catch (error) {
    console.error('rejectVerificationRequest exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 강사 프로필 생성
export async function createInstructorProfile(profileId: string, data: {
  bio: string
  expertise: string[]
  hourlyRate: number
  availability: string[]
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const { error } = await supabase
      .from('instructors')
      .insert({
        profile_id: profileId,
        bio: data.bio,
        expertise: data.expertise,
        hourly_rate: data.hourlyRate,
        availability: data.availability,
      })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 회사 프로필 생성
export async function createCompanyProfile(profileId: string, data: {
  companyName: string
  industry: string
  companySize: string
  description: string
  website?: string
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const { error } = await supabase
      .from('companies')
      .insert({
        profile_id: profileId,
        company_name: data.companyName,
        industry: data.industry,
        company_size: data.companySize,
        description: data.description,
        website: data.website,
      })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 모든 기업 가져오기
export async function getAllCompanies(): Promise<{ success: boolean; data: any[] | null; error?: AuthError }> {
  try {
    console.log('getAllCompanies called')
    
    // 먼저 companies를 가져옴
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (companiesError) {
      console.error('getAllCompanies error:', companiesError)
      return { success: false, data: null, error: { message: companiesError.message } }
    }

    // 각 company에 대해 profile 정보를 가져옴
    const enrichedData = await Promise.all(
      companies?.map(async (company) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, email, is_verified')
          .eq('id', company.profile_id)
          .single()

        return {
          ...company,
          profile: profileData
        }
      }) || []
    )

    console.log('getAllCompanies success, count:', enrichedData?.length)
    return { success: true, data: enrichedData }
  } catch (error) {
    console.error('getAllCompanies exception:', error)
    return { success: false, data: null, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 기업 프로필 업데이트
export async function updateCompanyProfile(companyId: string, data: {
  company_name?: string
  industry?: string
  company_size?: string
  description?: string
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('updateCompanyProfile called with:', { companyId, data })
    
    const { error } = await supabase
      .from('companies')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)

    if (error) {
      console.error('updateCompanyProfile error:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('updateCompanyProfile success')
    return { success: true }
  } catch (error) {
    console.error('updateCompanyProfile exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 기업 프로필 삭제
export async function deleteCompanyProfile(companyId: string): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('deleteCompanyProfile called with:', companyId)
    
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)

    if (error) {
      console.error('deleteCompanyProfile error:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('deleteCompanyProfile success')
    return { success: true }
  } catch (error) {
    console.error('deleteCompanyProfile exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 대시보드 통계 데이터 가져오기
export async function getDashboardStats(): Promise<{
  totalInstructors: number
  totalCompanies: number
  totalProfiles: number
  pendingVerifications: number
  totalVerifications: number
  approvedVerifications: number
  recentInstructors: number
  recentCompanies: number
  totalProjects: number
  inProgressProjects: number
  completedProjects: number
  totalAnnouncements: number
  publishedAnnouncements: number
  draftAnnouncements: number
  totalDocuments: number
  pendingDocuments: number
  approvedDocuments: number
  rejectedDocuments: number
}> {
  try {
    console.log('📊 Fetching dashboard stats...')
    
    // 1. 총 강사 수
    const { count: instructorCount } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true })
    
    // 2. 총 기업 수
    const { count: companyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
    
    // 3. 총 프로필 수
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // 4. 대기 중인 검증 요청 수
    const { count: pendingVerificationCount } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    // 5. 전체 검증 요청 수
    const { count: totalVerificationCount } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
    
    // 6. 승인된 검증 요청 수
    const { count: approvedVerificationCount } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    // 7. 프로젝트 통계
    const { count: totalProjectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
    
    const { count: inProgressProjectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress')
    
    const { count: completedProjectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
    
    // 8. 공지사항 통계
    const { count: totalAnnouncementCount } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
    
    const { count: publishedAnnouncementCount } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
    
    const { count: draftAnnouncementCount } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false)
    
    // 9. 문서 통계
    const { count: totalDocumentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
    
    const { count: pendingDocumentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { count: approvedDocumentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    const { count: rejectedDocumentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
    
    // 10. 최근 30일 데이터
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: recentInstructorCount } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const { count: recentCompanyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const stats = {
      totalInstructors: instructorCount || 0,
      totalCompanies: companyCount || 0,
      totalProfiles: profileCount || 0,
      pendingVerifications: pendingVerificationCount || 0,
      totalVerifications: totalVerificationCount || 0,
      approvedVerifications: approvedVerificationCount || 0,
      recentInstructors: recentInstructorCount || 0,
      recentCompanies: recentCompanyCount || 0,
      totalProjects: totalProjectCount || 0,
      inProgressProjects: inProgressProjectCount || 0,
      completedProjects: completedProjectCount || 0,
      totalAnnouncements: totalAnnouncementCount || 0,
      publishedAnnouncements: publishedAnnouncementCount || 0,
      draftAnnouncements: draftAnnouncementCount || 0,
      totalDocuments: totalDocumentCount || 0,
      pendingDocuments: pendingDocumentCount || 0,
      approvedDocuments: approvedDocumentCount || 0,
      rejectedDocuments: rejectedDocumentCount || 0
    }
    
    console.log('📊 Dashboard stats:', stats)
    return stats
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error)
    return {
      totalInstructors: 0,
      totalCompanies: 0,
      totalProfiles: 0,
      pendingVerifications: 0,
      totalVerifications: 0,
      approvedVerifications: 0,
      recentInstructors: 0,
      recentCompanies: 0,
      totalProjects: 0,
      inProgressProjects: 0,
      completedProjects: 0,
      totalAnnouncements: 0,
      publishedAnnouncements: 0,
      draftAnnouncements: 0,
      totalDocuments: 0,
      pendingDocuments: 0,
      approvedDocuments: 0,
      rejectedDocuments: 0
    }
  }
}

// 프로젝트 관련 함수들
export async function getAllProjects(): Promise<{ data: any[] | null; error?: any; success: boolean }> {
  try {
    console.log('📋 Fetching all projects...')
    
    // 먼저 기본 프로젝트 데이터만 가져오기
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching projects:', error)
      return { data: null, error, success: false }
    }

    console.log('✅ Projects fetched successfully:', projects?.length || 0)
    
    // 기업 정보는 별도로 가져오기
    if (projects && projects.length > 0) {
      const companyIds = [...new Set(projects.map(p => p.company_id).filter(Boolean))]
      console.log('📋 Fetching company data for IDs:', companyIds)
      
      if (companyIds.length > 0) {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, company_name, industry')
          .in('id', companyIds)
        
        if (!companiesError && companies) {
          const companyMap = companies.reduce((acc, company) => {
            acc[company.id] = company
            return acc
          }, {} as Record<string, any>)
          
          // 프로젝트에 기업 정보 추가
          projects.forEach(project => {
            project.companies = companyMap[project.company_id] || null
          })
        }
      }
    }

    return { data: projects, success: true }
  } catch (error) {
    console.error('❌ Exception fetching projects:', error)
    return { data: null, error, success: false }
  }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    console.log('📋 Fetching project by ID:', projectId)
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        companies (
          id,
          company_name,
          industry,
          profiles (
            id,
            full_name,
            email
          )
        ),
        instructors (
          id,
          full_name,
          email,
          profiles (
            id,
            full_name,
            email
          )
        )
      `)
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('❌ Error fetching project:', error)
      return null
    }

    console.log('✅ Project fetched successfully:', data?.title)
    return data
  } catch (error) {
    console.error('❌ Exception fetching project:', error)
    return null
  }
}

export async function createProject(projectData: {
  title: string
  description: string
  company_id: string
  budget_range?: string
  duration?: string
  location?: string
  status?: string
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Creating project via API:', projectData.title)
    console.log('📋 Project data:', projectData)
    
    // 필수 필드 검증
    if (!projectData.title || !projectData.description || !projectData.company_id) {
      console.error('❌ Missing required fields:', { title: !!projectData.title, description: !!projectData.description, company_id: !!projectData.company_id })
      return { success: false, error: { message: '필수 필드를 모두 입력해주세요.' } }
    }
    
    // API 라우트를 통해 프로젝트 생성
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    })
    
    const result = await response.json()
    console.log('📋 API response:', result)
    
    if (!response.ok) {
      console.error('❌ API error:', result)
      return { success: false, error: { message: result.error || '프로젝트 생성에 실패했습니다.' } }
    }
    
    if (result.success) {
      console.log('✅ Project created successfully via API')
      return { success: true }
    } else {
      console.error('❌ API returned success: false:', result)
      return { success: false, error: { message: result.error || '프로젝트 생성에 실패했습니다.' } }
    }
    
  } catch (error) {
    console.error('❌ Exception creating project:', error)
    console.error('❌ Exception type:', typeof error)
    console.error('❌ Exception message:', error instanceof Error ? error.message : error)
    return { success: false, error: { message: '프로젝트 생성 중 오류가 발생했습니다.' } }
  }
}

export async function updateProject(projectData: {
  id: string
  title: string
  description: string
  company_id: string
  budget_range?: string
  duration?: string
  location?: string
  status?: string
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Updating project via API:', projectData.id)
    console.log('📋 Update data:', projectData)
    
    // 필수 필드 검증
    if (!projectData.id || !projectData.title || !projectData.description || !projectData.company_id) {
      console.error('❌ Missing required fields for update:', { 
        id: !!projectData.id, 
        title: !!projectData.title, 
        description: !!projectData.description, 
        company_id: !!projectData.company_id 
      })
      return { success: false, error: { message: '필수 필드를 모두 입력해주세요.' } }
    }
    
    // API 라우트를 통해 프로젝트 수정
    const response = await fetch('/api/projects', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    })
    
    const result = await response.json()
    console.log('📋 API update response:', result)
    
    if (!response.ok) {
      console.error('❌ API update error:', result)
      return { success: false, error: { message: result.error || '프로젝트 수정에 실패했습니다.' } }
    }
    
    if (result.success) {
      console.log('✅ Project updated successfully via API')
      return { success: true }
    } else {
      console.error('❌ API update returned success: false:', result)
      return { success: false, error: { message: result.error || '프로젝트 수정에 실패했습니다.' } }
    }
    
  } catch (error) {
    console.error('❌ Exception updating project:', error)
    console.error('❌ Exception type:', typeof error)
    console.error('❌ Exception message:', error instanceof Error ? error.message : error)
    return { success: false, error: { message: '프로젝트 수정 중 오류가 발생했습니다.' } }
  }
}

export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Deleting project via API:', projectId)
    
    if (!projectId) {
      console.error('❌ Missing project ID for deletion')
      return { success: false, error: { message: '프로젝트 ID가 필요합니다.' } }
    }
    
    // API 라우트를 통해 프로젝트 삭제
    const response = await fetch(`/api/projects?id=${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const result = await response.json()
    console.log('📋 API delete response:', result)
    
    if (!response.ok) {
      console.error('❌ API delete error:', result)
      return { success: false, error: { message: result.error || '프로젝트 삭제에 실패했습니다.' } }
    }
    
    if (result.success) {
      console.log('✅ Project deleted successfully via API')
      return { success: true }
    } else {
      console.error('❌ API delete returned success: false:', result)
      return { success: false, error: { message: result.error || '프로젝트 삭제에 실패했습니다.' } }
    }
    
  } catch (error) {
    console.error('❌ Exception deleting project:', error)
    console.error('❌ Exception type:', typeof error)
    console.error('❌ Exception message:', error instanceof Error ? error.message : error)
    return { success: false, error: { message: '프로젝트 삭제 중 오류가 발생했습니다.' } }
  }
}

// 공지사항 타입 정의
export type Announcement = {
  id: string
  title: string
  content: string
  category?: string
  is_pinned?: boolean
  is_published: boolean
  author_id?: string
  author_name?: string
  view_count?: number
  published_at?: string
  created_at: string
  updated_at: string
}



// 모든 공지사항 가져오기
export async function getAllAnnouncements(): Promise<{ success: boolean; data: Announcement[] | null; error?: AuthError }> {
  try {
    console.log('📋 getAllAnnouncements called')
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ getAllAnnouncements error:', error)
      return { success: false, data: null, error: { message: error.message } }
    }

    console.log('✅ getAllAnnouncements success, count:', data?.length)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ getAllAnnouncements exception:', error)
    return { success: false, data: null, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 공지사항 생성
export async function createAnnouncement(announcementData: {
  title: string
  content: string
  category?: string
  status?: 'draft' | 'published'
  scheduledPublishDate?: string
  scheduledPublishTime?: string
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Creating announcement:', announcementData.title)
    
    // 예약 발행 시간 계산
    let publishedAt = null
    if (announcementData.status === 'published') {
      if (announcementData.scheduledPublishDate && announcementData.scheduledPublishTime) {
        // 예약 발행인 경우
        const scheduledDateTime = new Date(`${announcementData.scheduledPublishDate}T${announcementData.scheduledPublishTime}`)
        publishedAt = scheduledDateTime.toISOString()
      } else {
        // 즉시 발행인 경우
        publishedAt = new Date().toISOString()
      }
    }

    const insertData = {
      title: announcementData.title,
      content: announcementData.content,
      category: announcementData.category || 'general',
      is_pinned: false,
      is_published: announcementData.status === 'published',
      author_name: '관리자',
      view_count: 0,
      published_at: publishedAt
    }
    
    const { data: insertedData, error } = await supabase
      .from('announcements')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating announcement:', error)
      return { success: false, error: { message: error.message } }
    }

    // 발행된 공지사항인 경우 활동 로그 생성
    if (insertData.is_published) {
      await logAnnouncementPublished(announcementData.title, '관리자', insertedData?.id)
    }

    console.log('✅ Announcement created successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Exception creating announcement:', error)
    return { success: false, error: { message: '공지사항 생성 중 오류가 발생했습니다.' } }
  }
}

// 공지사항 수정
export async function updateAnnouncement(announcementData: {
  id: string
  title: string
  content: string
  status: 'draft' | 'published'
  scheduledPublishDate?: string
  scheduledPublishTime?: string
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Updating announcement:', announcementData.id)
    
    // 예약 발행 시간 계산
    let publishedAt = null
    if (announcementData.status === 'published') {
      if (announcementData.scheduledPublishDate && announcementData.scheduledPublishTime) {
        // 예약 발행인 경우
        const scheduledDateTime = new Date(`${announcementData.scheduledPublishDate}T${announcementData.scheduledPublishTime}`)
        publishedAt = scheduledDateTime.toISOString()
      } else {
        // 즉시 발행인 경우
        publishedAt = new Date().toISOString()
      }
    }

    const updateData = {
      title: announcementData.title,
      content: announcementData.content,
      is_published: announcementData.status === 'published',
      published_at: publishedAt
    }
    
    const { error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', announcementData.id)

    if (error) {
      console.error('❌ Error updating announcement:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('✅ Announcement updated successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Exception updating announcement:', error)
    return { success: false, error: { message: '공지사항 수정 중 오류가 발생했습니다.' } }
  }
}

// 공지사항 삭제
export async function deleteAnnouncement(announcementId: string): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Deleting announcement:', announcementId)
    
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)

    if (error) {
      console.error('❌ Error deleting announcement:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('✅ Announcement deleted successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Exception deleting announcement:', error)
    return { success: false, error: { message: '공지사항 삭제 중 오류가 발생했습니다.' } }
  }
}

// 발행된 공지사항만 가져오기 (사용자용)
export async function getPublishedAnnouncements(): Promise<{ success: boolean; data: Announcement[] | null; error?: AuthError }> {
  try {
    console.log('📋 getPublishedAnnouncements called')
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('❌ getPublishedAnnouncements error:', error)
      return { success: false, data: null, error: { message: error.message } }
    }

    console.log('✅ getPublishedAnnouncements success, count:', data?.length)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ getPublishedAnnouncements exception:', error)
    return { success: false, data: null, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// Activity Log Types
export interface ActivityLog {
  id: string
  type: string
  title: string
  description?: string
  user_id?: string
  user_name?: string
  related_id?: string
  related_type?: string
  created_at: string
  updated_at?: string
}

export type ActivityType = 
  | 'instructor_registration'
  | 'company_registration'
  | 'project_application'
  | 'project_matching'
  | 'project_completion'
  | 'project_status_changed'
  | 'verification_approved'
  | 'verification_rejected'
  | 'announcement_published'
  | 'instructor_profile_updated'
  | 'company_profile_updated'
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'

// 활동 로그 가져오기
export async function getActivityLogs(page: number = 1, limit: number = 5): Promise<{ success: boolean; data: ActivityLog[] | null; error?: AuthError; total: number }> {
  try {
    console.log('📋 getActivityLogs called with page:', page, 'limit:', limit)
    
    const offset = (page - 1) * limit
    
    const { data, error, count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ getActivityLogs error:', error)
      return { success: false, data: null, error: { message: error.message }, total: 0 }
    }

    console.log('✅ getActivityLogs success, count:', data?.length, 'total:', count)
    return { success: true, data: data || [], total: count || 0 }
  } catch (error) {
    console.error('❌ getActivityLogs exception:', error)
    return { success: false, data: null, error: { message: '알 수 없는 오류가 발생했습니다.' }, total: 0 }
  }
}

// 활동 로그 생성
export async function createActivityLog(activityData: {
  type: string
  title: string
  description: string
  user_name?: string
  user_id?: string
  related_id?: string
  related_type?: string
}): Promise<{ success: boolean; error?: AuthError }> {
  try {
    console.log('📋 Creating activity log:', activityData.title)
    
    const { error } = await supabase
      .from('activity_logs')
      .insert(activityData)

    if (error) {
      console.error('❌ Error creating activity log:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('✅ Activity log created successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Exception creating activity log:', error)
    return { success: false, error: { message: '활동 로그 생성 중 오류가 발생했습니다.' } }
  }
}

// Auto Activity Log Functions
export async function logInstructorRegistration(userName: string, userId?: string) {
  return createActivityLog({
    type: 'instructor_registration',
    title: '새 강사 등록',
    description: `${userName}님이 강사로 등록했습니다.`,
    user_name: userName,
    user_id: userId,
    related_type: 'instructor'
  })
}

export async function logCompanyRegistration(companyName: string, userId?: string) {
  return createActivityLog({
    type: 'company_registration',
    title: '새 기업 등록',
    description: `${companyName}이(가) 플랫폼에 가입했습니다.`,
    user_name: companyName,
    user_id: userId,
    related_type: 'company'
  })
}

export async function logProjectApplication(projectTitle: string, companyName: string, projectId?: string) {
  return createActivityLog({
    type: 'project_application',
    title: '신청서 접수',
    description: `${companyName}의 "${projectTitle}" 프로젝트 신청이 접수되었습니다.`,
    user_name: companyName,
    related_id: projectId,
    related_type: 'project'
  })
}

export async function logProjectMatching(projectTitle: string, instructorName: string, companyName: string, projectId?: string) {
  return createActivityLog({
    type: 'project_matching',
    title: '프로젝트 매칭 완료',
    description: `${companyName}의 "${projectTitle}" 프로젝트와 ${instructorName}님의 매칭이 완료되었습니다.`,
    user_name: instructorName,
    related_id: projectId,
    related_type: 'project'
  })
}

export async function logProjectCompletion(projectTitle: string, instructorName: string, projectId?: string) {
  return createActivityLog({
    type: 'project_completion',
    title: '프로젝트 완료',
    description: `${instructorName}님의 "${projectTitle}" 프로젝트가 성공적으로 완료되었습니다.`,
    user_name: instructorName,
    related_id: projectId,
    related_type: 'project'
  })
}

export async function logVerificationApproved(instructorName: string, userId?: string) {
  return createActivityLog({
    type: 'verification_approved',
    title: '프로필 검증 승인',
    description: `${instructorName}님의 프로필 검증이 승인되었습니다.`,
    user_name: instructorName,
    user_id: userId,
    related_type: 'verification'
  })
}

export async function logVerificationRejected(instructorName: string, userId?: string) {
  return createActivityLog({
    type: 'verification_rejected',
    title: '프로필 검증 거부',
    description: `${instructorName}님의 프로필 검증이 거부되었습니다.`,
    user_name: instructorName,
    user_id: userId,
    related_type: 'verification'
  })
}

export async function logAnnouncementPublished(title: string, authorName: string = '관리자', announcementId?: string) {
  return createActivityLog({
    type: 'announcement_published',
    title: '공지사항 발행',
    description: `"${title}" 공지사항이 발행되었습니다.`,
    user_name: authorName,
    related_id: announcementId,
    related_type: 'announcement'
  })
}

export async function logProjectCreated(title: string, companyName: string, projectId?: string) {
  return createActivityLog({
    type: 'project_created',
    title: '새 프로젝트 생성',
    description: `${companyName}이(가) "${title}" 프로젝트를 생성했습니다.`,
    user_name: companyName,
    related_id: projectId,
    related_type: 'project'
  })
}

export async function logProjectUpdated(title: string, companyName: string, projectId?: string) {
  return createActivityLog({
    type: 'project_updated',
    title: '프로젝트 수정',
    description: `${companyName}이(가) "${title}" 프로젝트를 수정했습니다.`,
    user_name: companyName,
    related_id: projectId,
    related_type: 'project'
  })
}

export async function logProjectDeleted(title: string, companyName: string) {
  return createActivityLog({
    type: 'project_deleted',
    title: '프로젝트 삭제',
    description: `${companyName}이(가) "${title}" 프로젝트를 삭제했습니다.`,
    user_name: companyName,
    related_type: 'project'
  })
}
