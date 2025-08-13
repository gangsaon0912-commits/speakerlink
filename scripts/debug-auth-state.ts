import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugAuthState() {
  try {
    console.log('🔍 인증 상태 진단 시작...')
    
    // 1. 현재 세션 확인
    console.log('\n1️⃣ 현재 세션 확인...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ 세션 조회 오류:', sessionError)
    } else {
      console.log('✅ 세션 정보:', {
        exists: !!session,
        user: session?.user?.email,
        userId: session?.user?.id,
        expiresAt: session?.expires_at
      })
    }
    
    // 2. 브라우저 스토리지 확인 (시뮬레이션)
    console.log('\n2️⃣ 브라우저 스토리지 상태 확인...')
    console.log('📋 localStorage 키들:')
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('speakerlink')) {
          console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`)
        }
      })
    } else {
      console.log('  - Node.js 환경에서는 브라우저 스토리지를 확인할 수 없습니다.')
    }
    
    // 3. 테스트 사용자로 로그인 시도
    console.log('\n3️⃣ 테스트 사용자 로그인...')
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'instructor@test.com',
      password: 'test123456'
    })
    
    if (loginError) {
      console.error('❌ 로그인 실패:', loginError)
    } else {
      console.log('✅ 로그인 성공:', {
        email: user?.email,
        id: user?.id,
        emailConfirmed: user?.email_confirmed_at
      })
      
      // 4. 프로필 정보 확인
      console.log('\n4️⃣ 프로필 정보 확인...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()
      
      if (profileError) {
        console.error('❌ 프로필 조회 실패:', profileError)
      } else {
        console.log('✅ 프로필 정보:', {
          id: profile?.id,
          email: profile?.email,
          fullName: profile?.full_name,
          userType: profile?.user_type,
          isVerified: profile?.is_verified
        })
      }
      
      // 5. 강사 프로필 확인
      console.log('\n5️⃣ 강사 프로필 확인...')
      const { data: instructorProfile, error: instructorError } = await supabase
        .from('instructors')
        .select('*')
        .eq('profile_id', user?.id)
        .single()
      
      if (instructorError) {
        console.error('❌ 강사 프로필 조회 실패:', instructorError)
      } else {
        console.log('✅ 강사 프로필 정보:', {
          id: instructorProfile?.id,
          fullName: instructorProfile?.full_name,
          profileId: instructorProfile?.profile_id
        })
      }
    }
    
    console.log('\n🎉 인증 상태 진단 완료!')
    
  } catch (error) {
    console.error('❌ 진단 중 오류:', error)
  }
}

debugAuthState()
