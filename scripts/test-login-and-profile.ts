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

async function testLoginAndProfile() {
  try {
    console.log('🔍 로그인 및 프로필 테스트 시작...')
    
    // 1. 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'instructor@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ 로그인 오류:', authError)
      return
    }
    
    if (!authData.user) {
      console.error('❌ 로그인 실패: 사용자 데이터 없음')
      return
    }
    
    console.log('✅ 로그인 성공:', authData.user.email)
    console.log('📋 사용자 ID:', authData.user.id)
    console.log('📧 이메일 확인 상태:', authData.user.email_confirmed_at)
    
    // 2. 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ 세션 조회 오류:', sessionError)
      return
    }
    
    if (!session) {
      console.error('❌ 세션이 없습니다.')
      return
    }
    
    console.log('✅ 세션 확인됨')
    console.log('📋 액세스 토큰 길이:', session.access_token?.length || 0)
    console.log('📋 리프레시 토큰 길이:', session.refresh_token?.length || 0)
    
    // 3. 프로필 가져오기 (직접 쿼리)
    console.log('\n📋 직접 프로필 쿼리 테스트...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ 직접 프로필 쿼리 오류:', profileError)
      console.error('❌ 오류 코드:', profileError.code)
      console.error('❌ 오류 메시지:', profileError.message)
    } else {
      console.log('✅ 직접 프로필 쿼리 성공:', profile.full_name)
    }
    
    // 4. API 라우트 테스트 (시뮬레이션)
    console.log('\n📋 API 라우트 테스트 시뮬레이션...')
    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📋 API 응답 상태:', response.status)
      console.log('📋 API 응답 헤더:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ API 응답 성공:', result)
      } else {
        const errorText = await response.text()
        console.error('❌ API 응답 오류:', errorText)
      }
    } catch (apiError) {
      console.error('❌ API 호출 오류:', apiError)
    }
    
    // 5. 로그아웃
    await supabase.auth.signOut()
    console.log('✅ 로그아웃 완료')
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  }
}

testLoginAndProfile()
