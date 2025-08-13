import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'speakerlink-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: true
  }
})

async function testProfileLoading() {
  console.log('🔍 Testing profile loading...')
  
  try {
    // 1. 로그인
    console.log('1️⃣ Logging in as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ Login error:', authError)
      return
    }
    
    if (!authData.user) {
      console.error('❌ No user data after login')
      return
    }
    
    console.log('✅ Login successful:', authData.user.email)
    console.log('🆔 User ID:', authData.user.id)
    
    // 2. 세션 확인
    console.log('2️⃣ Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return
    }
    
    if (session) {
      console.log('✅ Session found:', session.user.email)
      console.log('🆔 Session User ID:', session.user.id)
    } else {
      console.log('❌ No session found')
      return
    }
    
    // 3. 프로필 직접 조회
    console.log('3️⃣ Fetching profile directly...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Profile error:', profileError)
      console.error('❌ Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      return
    }
    
    if (profile) {
      console.log('✅ Profile found:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        user_type: profile.user_type,
        is_verified: profile.is_verified,
        created_at: profile.created_at
      })
    } else {
      console.log('❌ No profile found')
    }
    
    // 4. 프로필 테이블 전체 조회
    console.log('4️⃣ Checking all profiles...')
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (allProfilesError) {
      console.error('❌ All profiles error:', allProfilesError)
    } else {
      console.log('✅ All profiles found:', allProfiles?.length || 0)
      allProfiles?.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.email} (${p.id})`)
      })
    }
    
    // 5. 특정 이메일로 프로필 조회
    console.log('5️⃣ Fetching profile by email...')
    const { data: profileByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@test.com')
      .single()
    
    if (emailError) {
      console.error('❌ Profile by email error:', emailError)
    } else {
      console.log('✅ Profile by email found:', {
        id: profileByEmail.id,
        email: profileByEmail.email,
        full_name: profileByEmail.full_name
      })
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testProfileLoading()
