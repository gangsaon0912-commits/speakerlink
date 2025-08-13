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

async function checkProfileLoading() {
  try {
    console.log('🔍 프로필 로딩 문제 진단...')
    
    // 1. 테스트 사용자 로그인
    console.log('\n1️⃣ 테스트 사용자 로그인...')
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'instructor@test.com',
      password: 'test123456'
    })
    
    if (loginError) {
      console.error('❌ 로그인 실패:', loginError)
      return
    }
    
    console.log('✅ 로그인 성공:', user?.email)
    console.log('🆔 User ID:', user?.id)
    
    // 2. 프로필 테이블에서 직접 조회
    console.log('\n2️⃣ 프로필 테이블 직접 조회...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()
    
    if (profileError) {
      console.error('❌ 프로필 조회 실패:', profileError)
      return
    }
    
    console.log('✅ 프로필 조회 성공:', profile)
    
    // 3. API 라우트 테스트
    console.log('\n3️⃣ API 라우트 테스트...')
    
    // 세션에서 액세스 토큰 가져오기
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔍 Session exists:', !!session)
    console.log('🔍 Access token length:', session?.access_token?.length || 0)
    
    if (session?.access_token) {
      const apiResponse = await fetch('http://localhost:3001/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📋 API 응답 상태:', apiResponse.status)
      
      if (apiResponse.ok) {
        const apiResult = await apiResponse.json()
        console.log('✅ API 성공:', apiResult)
      } else {
        const errorText = await apiResponse.text()
        console.error('❌ API 실패:', errorText)
      }
    } else {
      console.error('❌ 액세스 토큰이 없습니다.')
    }
    
    // 4. 강사 프로필 확인
    console.log('\n4️⃣ 강사 프로필 확인...')
    const { data: instructorProfile, error: instructorError } = await supabase
      .from('instructors')
      .select('*')
      .eq('profile_id', user?.id)
      .single()
    
    if (instructorError) {
      console.error('❌ 강사 프로필 조회 실패:', instructorError)
    } else {
      console.log('✅ 강사 프로필 확인:', instructorProfile?.full_name)
    }
    
    console.log('\n🎉 프로필 로딩 진단 완료!')
    
  } catch (error) {
    console.error('❌ 진단 중 오류:', error)
  }
}

checkProfileLoading()
