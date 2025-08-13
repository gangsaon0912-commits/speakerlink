import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 환경 변수 안전 처리
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ API: Missing Supabase environment variables')
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      console.error('❌ API: Supabase client not initialized')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const { email, password, fullName, userType } = await request.json()
    
    console.log('📧 API: Signup request for:', email)
    
    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ 
        success: false, 
        error: '모든 필수 정보를 입력해주세요.' 
      }, { status: 400 })
    }

    // 1. 사용자 계정 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // 이메일 자동 확인
      user_metadata: {
        full_name: fullName,
        user_type: userType,
      }
    })

    if (authError) {
      console.error('❌ API: User creation error:', authError)
      return NextResponse.json({ 
        success: false, 
        error: authError.message 
      }, { status: 400 })
    }

    if (!authData.user) {
      console.error('❌ API: No user data returned')
      return NextResponse.json({ 
        success: false, 
        error: '사용자 생성에 실패했습니다.' 
      }, { status: 500 })
    }

    console.log('✅ API: User created successfully:', authData.user.email)

    // 2. 프로필 생성 (서비스 롤 키 사용)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        user_type: userType,
        email_verified: true, // 관리자가 생성한 사용자는 이메일 확인됨
        is_verified: false, // 기본적으로 미인증 상태
      })

    if (profileError) {
      console.error('❌ API: Profile creation error:', profileError)
      // 사용자는 생성되었지만 프로필 생성 실패 - 사용자 삭제
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ 
        success: false, 
        error: profileError.message 
      }, { status: 500 })
    }

    console.log('✅ API: Profile created successfully')

    // 3. 강사인 경우 강사 프로필도 생성
    if (userType === 'instructor') {
      const { error: instructorError } = await supabase
        .from('instructors')
        .insert({
          profile_id: authData.user.id,
          bio: '',
          expertise: [],
          hourly_rate: 0,
          availability: [],
          rating: 0,
          total_reviews: 0,
          full_name: fullName // full_name 컬럼 추가
        })

      if (instructorError) {
        console.error('❌ API: Instructor profile creation error:', instructorError)
        // 강사 프로필 생성 실패해도 계정은 유지
      } else {
        console.log('✅ API: Instructor profile created successfully')
      }
    }

    // 4. 기업인 경우 기업 프로필도 생성
    if (userType === 'company') {
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          profile_id: authData.user.id,
          company_name: fullName,
          description: '',
          industry: '',
          size: '',
          website: '',
          location: ''
        })

      if (companyError) {
        console.error('❌ API: Company profile creation error:', companyError)
        // 기업 프로필 생성 실패해도 계정은 유지
      } else {
        console.log('✅ API: Company profile created successfully')
      }
    }

    console.log('🎉 API: Signup completed successfully')
    return NextResponse.json({ 
      success: true, 
      message: '회원가입이 완료되었습니다.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        user_type: userType
      }
    })

  } catch (error) {
    console.error('❌ API: Signup exception:', error)
    return NextResponse.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
