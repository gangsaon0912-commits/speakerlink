import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 클라이언트 측 Supabase 클라이언트 (웹 앱과 동일한 설정)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'speakerlink-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

async function testProfileAccess() {
  console.log('🔍 Testing profile access...')
  
  try {
    // 1. 로그인
    console.log('1️⃣ Logging in...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ Login error:', authError)
      return
    }
    
    console.log('✅ Login successful:', authData.user?.email)
    console.log('🆔 User ID:', authData.user?.id)
    
    // 2. 세션 확인
    console.log('2️⃣ Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session exists:', !!session, 'Error:', sessionError)
    
    if (session?.user) {
      // 3. 프로필 데이터 접근 테스트
      console.log('3️⃣ Testing profile access...')
      console.log('About to query profiles table for user ID:', session.user.id)
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      console.log('Profile query completed')
      console.log('Profile data:', profile)
      console.log('Profile error:', profileError)
      
      if (profile) {
        console.log('✅ Profile access successful')
        console.log('Full name:', profile.full_name)
        console.log('User type:', profile.user_type)
      } else {
        console.log('❌ Profile access failed')
        
        // 4. 다른 방법으로 프로필 확인
        console.log('4️⃣ Trying alternative profile access...')
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'admin@test.com')
        
        console.log('All profiles for admin@test.com:', allProfiles)
        console.log('All profiles error:', allProfilesError)
      }
    }
    
  } catch (error) {
    console.error('Error testing profile access:', error)
  }
}

testProfileAccess()
